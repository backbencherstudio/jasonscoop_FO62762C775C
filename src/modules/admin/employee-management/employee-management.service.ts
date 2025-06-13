import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateManagementDto } from './dto/create-management.dto';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { DeleteService } from '../utils/delete.service';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    _count: {
      select: {
        user_orders: true;
        products: true;
      };
    };
    reviews: {
      select: {
        rating_value: true;
      };
    };
    products: {
      select: {
        id: true;
        product_categories: {
          select: {
            category: {
              select: {
                name: true;
              };
            };
          };
        };
      };
    };
  };
}>;

// Move DTOs to separate files for better organization
export interface AddNewUserDto {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  gender?: string;
  status?: number;
}

@Injectable()
export class ManagementService extends PrismaClient {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deleteService: DeleteService,
  ) {
    super();
  }

  create(createManagementDto: CreateManagementDto) {
    return 'This action adds a new management';
  }

  private buildWhereCondition(
    type: string,
    q?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = { type };

    if (q) {
      const trimmedQuery = q.trim(); // Trim leading and trailing spaces
      where.OR = [
        { name: { contains: trimmedQuery, mode: 'insensitive' } },
        { email: { contains: trimmedQuery, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate + 'T00:00:00.000Z'); // Start of the day
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate + 'T23:59:59.999Z'); // End of the day
      }
    }

    return where;
  }

  private sortData(
    data: any[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    if (!sortBy || sortBy === 'default') return data;

    return [...data].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'total_no_of_fulfillment') {
        comparison = a.total_fulfillment - b.total_fulfillment;
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  private sortVendorData(
    data: any[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    if (!sortBy || sortBy === 'default') return data;

    return [...data].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'no_of_products') {
        comparison = a.total_products - b.total_products;
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  private sortSupportTeamData(
    data: any[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    if (!sortBy || sortBy === 'default') return data;

    return [...data].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'tickets_resolved') {
        comparison = a.tickets_resolved - b.tickets_resolved;
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // find all companies who user type is logistic_manager
  async findAllCompanies({
    filters: {
      q,
      cursor,
      page = 1,
      limit = 10,
      startDate,
      endDate,
      sortBy,
      sortOrder = 'desc',
    },
  }) {
    try {
      const where = this.buildWhereCondition(
        'logistic_manager',
        q,
        startDate,
        endDate,
      );

      // Reset pagination to first page if searching
      const currentPage = q ? 1 : page;

       // First get total count with search filter
      const total_items_count = await this.prisma.user.count({ where });

      // const query_condition: any = {};
      const query_condition: any = {
        skip: (Number(currentPage) - 1) * Number(limit),
        take: Number(limit),
      };
      // if (cursor) {
      //   query_condition.cursor = { id: cursor };
      //   query_condition.skip = 1;
      // }

      // if (page) {
      //   query_condition.skip = (Number(page) - 1) * Number(limit);
      // }

      // if (limit) {
      //   query_condition.take = Number(limit);
      // }

      // // Handle sorting
      // let orderBy: any = { created_at: sortOrder }; // Default sorting by created_at

      // if (sortBy && sortBy !== 'default') {
      //   if (sortBy === 'rating') {
      //     orderBy = { reviews: { _avg: { rating_value: sortOrder } } };
      //   } else if (sortBy === 'total_no_of_fulfillment') {
      //     orderBy = { user_orders: { _count: sortOrder } };
      //   }
      // }

      // const total_items_count = await this.prisma.user.count({ where });

      const companies = (await this.prisma.user.findMany({
        where,
        ...query_condition,
        orderBy: {
          created_at: sortOrder, // Sort by created_at based on sortOrder
        },
        include: {
          _count: {
            select: {
              user_orders: {
                where: { status: 'completed' },
              },
            },
          },
          reviews: {
            select: { rating_value: true },
          },
        },
      })) as UserWithRelations[];

      const mappedData = companies.map((company) => ({
        id: company.id,
        name: company.name,
        email: company.email,
        phone_number: company.phone_number,
        registered_date: company.created_at,
        total_fulfillment: company._count.user_orders,
        rating: this.calculateAverageRating(company.reviews),
        status: company.status === 1 ? 'active' : 'inactive',
      }));

      const sortedData = this.sortData(
        mappedData,
        sortBy,
        sortOrder as 'asc' | 'desc',
      );

      return {
        success: true,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(total_items_count / Number(limit)),
          total_items: total_items_count,
          cursor: cursor,
        },
        data: sortedData,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // find all Individual Agents whoes account type is logistic_agent
 async findAllIndividualAgents({
  filters: {
    q,
    cursor,
    page = 1,
    limit = 10,
    startDate,
    endDate,
    sortBy,
    sortOrder = 'desc',
  },
}) {
  try {
    const where = this.buildWhereCondition(
      'logistic_agent',
      q,
      startDate,
      endDate,
    );

    // Reset pagination to first page if searching
    const currentPage = q ? 1 : page;

    // First get total count with search filter
    const total_items_count = await this.prisma.user.count({ where });

    const query_condition: any = {
      skip: (Number(currentPage) - 1) * Number(limit),
      take: Number(limit),
    };

    const agents = (await this.prisma.user.findMany({
      where,
      ...query_condition,
      orderBy: {
        created_at: sortOrder,
      },
      include: {
        _count: {
          select: {
            user_orders: {
              where: { status: 'completed' },
            },
          },
        },
        reviews: {
          select: { rating_value: true },
        },
      },
    })) as UserWithRelations[];

    const mappedData = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone_number: agent.phone_number,
      registered_date: agent.created_at,
      total_fulfillment: agent._count.user_orders,
      rating: this.calculateAverageRating(agent.reviews),
      status: agent.status === 1 ? 'active' : 'inactive',
    }));

    const sortedData = this.sortData(
      mappedData,
      sortBy,
      sortOrder as 'asc' | 'desc',
    );

    return {
      success: true,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total_items_count / Number(limit)),
        total_items: total_items_count,
        cursor: cursor,
      },
      data: sortedData,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

  // find all vendors whoes account type is vendors
  async findAllVendors({
    filters: {
      q,
      cursor,
      page = 1,
      limit = 10,
      startDate,
      endDate,
      sortBy,
      sortOrder = 'desc',
    },
  }) {
    try {
      const where = this.buildWhereCondition('vendor', q, startDate, endDate);

        // Reset pagination to first page if searching
      const currentPage = q ? 1 : page;

      const total_items_count = await this.prisma.user.count({ where });

      const vendors = (await this.prisma.user.findMany({
        where,
        skip: (Number(currentPage) - 1) * Number(limit),
        take: Number(limit),
        include: {
          _count: {
            select: {
              products: true,
            },
          },
          reviews: {
            select: { rating_value: true },
          },
          products: {
            select: {
              id: true,
              product_categories: {
                select: {
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      })) as UserWithRelations[];

      const mappedData = vendors.map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone_number: vendor.phone_number,
        registered_date: vendor.created_at,
        product_categories: [
          ...new Set(
            vendor.products.flatMap((product) =>
              product.product_categories.map((pc) => pc.category.name),
            ),
          ),
        ],
        total_products: vendor._count.products,
        rating: this.calculateAverageRating(vendor.reviews),
        status: vendor.status === 1 ? 'active' : 'inactive',
      }));

      const sortedData = this.sortVendorData(
        mappedData,
        sortBy,
        sortOrder as 'asc' | 'desc',
      );

      return {
        success: true,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(total_items_count / Number(limit)),
          total_items: total_items_count,
        },
        data: sortedData,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // find all support whoes account type is support
  async findAllSupportTeam({ filters: { q, cursor, page = 1, limit = 10, sortBy, sortOrder = 'desc' } }) {
    try {
      const where: any = {
        type: 'support_team',
      };

      if (q) {
        const trimContent = q.trim()
        where.OR = [
          { name: { contains: trimContent, mode: 'insensitive' } },
          { email: { contains: trimContent, mode: 'insensitive' } },
        ];
      }

      // Build query conditions for pagination
      const query_condition: any = {};

      const currentPage = q ? 1 : page;

      // Handle cursor-based pagination
      if (cursor) {
        query_condition.cursor = { id: cursor };
        query_condition.skip = 1;
      } else {
        // Handle offset-based pagination
        query_condition.skip = (Number(currentPage) - 1) * Number(limit);
      }

      // Set limit for both pagination types
      query_condition.take = Number(limit);

      // Get total count for pagination
      const total_items_count = await this.prisma.user.count({ where });
 
      // Fetch support team members with pagination
      const supportTeam = await this.prisma.user.findMany({
        where,
        ...query_condition,
        orderBy: {
          created_at: sortOrder, // Default sorting by created_at
        },
        include: {
          _count: {
            select: {
              user_orders: {
                where: {
                  status: 'resolved',
                },
              },
            },
          },
          reviews: {
            select: {
              rating_value: true,
            },
          },
        },
      }) as UserWithRelations[];

      // Map the data
      const mappedData = supportTeam.map((support) => ({
        id: support.id,
        name: support.name,
        email: support.email,
        phone_number: support.phone_number,
        registered_date: support.created_at,
        gender: support.gender,
        tickets_resolved: support._count.user_orders,
        rating: this.calculateAverageRating(support.reviews),
        status: support.status === 1 ? 'active' : 'inactive',
      }));

      // Sort the data if needed
      const sortedData = this.sortSupportTeamData(mappedData, sortBy, sortOrder as 'asc' | 'desc');

      // Get the last item's ID for cursor-based pagination
      const lastItem = supportTeam[supportTeam.length - 1];
      const nextCursor = lastItem?.id;

      return {
        success: true,
        pagination: {
          current_page: Number(page),
          total_pages: Math.ceil(total_items_count / Number(limit)),
          total_items: total_items_count,
          cursor: nextCursor || null,
          has_more: supportTeam.length === Number(limit),
        },
        data: sortedData,
      };
    } catch (error) {
      // console.error('Support Team Error:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  private calculateAverageRating(reviews: { rating_value: number }[]) {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating_value, 0);
    return Number((sum / reviews.length).toFixed(1));
  }

  async deleteUser(userId: string) {
    return await this.deleteService.deleteUser(userId);
  }

  // Method to add a new company
  async addNewCompany(data: AddNewUserDto) {
    try {
      const newCompany = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone_number: data.phone_number,
          password: data.password,
          type: 'logistic_manager',
          gender: data.gender || 'not_specified',
          status: data.status || 1,
        },
      });

      return {
        success: true,
        data: {
          id: newCompany.id,
          name: newCompany.name,
          email: newCompany.email,
          phone_number: newCompany.phone_number,
          type: newCompany.type,
          status: newCompany.status === 1 ? 'active' : 'inactive',
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to add new company: ${error.message}`);
    }
  }

  // Method to add a new agent
  async addNewAgent(data: AddNewUserDto) {
    try {
      const newAgent = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone_number: data.phone_number,
          password: data.password,
          type: 'logistic_agent',
          gender: data.gender || 'not_specified',
          status: data.status || 1,
        },
      });

      return {
        success: true,
        data: {
          id: newAgent.id,
          name: newAgent.name,
          email: newAgent.email,
          phone_number: newAgent.phone_number,
          type: newAgent.type,
          status: newAgent.status === 1 ? 'active' : 'inactive',
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to add new agent: ${error.message}`);
    }
  }

  // Method to add a new vendor
  async addNewVendor(data: AddNewUserDto) {
    try {
      const newVendor = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone_number: data.phone_number,
          password: data.password,
          type: 'vendor',
          gender: data.gender || 'not_specified',
          status: data.status || 1,
        },
      });

      return {
        success: true,
        data: {
          id: newVendor.id,
          name: newVendor.name,
          email: newVendor.email,
          phone_number: newVendor.phone_number,
          type: newVendor.type,
          status: newVendor.status === 1 ? 'active' : 'inactive',
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to add new vendor: ${error.message}`);
    }
  }

  // Method to add a new support member
  async addNewSupportMember(data: AddNewUserDto) {
    try {
      const newSupport = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone_number: data.phone_number,
          password: data.password,
          type: 'support_team',
          gender: data.gender || 'not_specified',
          status: data.status || 1,
        },
      });

      return {
        success: true,
        data: {
          id: newSupport.id,
          name: newSupport.name,
          email: newSupport.email,
          phone_number: newSupport.phone_number,
          type: newSupport.type,
          status: newSupport.status === 1 ? 'active' : 'inactive',
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to add new support member: ${error.message}`);
    }
  }
}
