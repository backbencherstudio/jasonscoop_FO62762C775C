import { Injectable } from '@nestjs/common';
import { CreateReturnProductDto } from './dto/create-return-product.dto';
import { UpdateReturnProductDto } from './dto/update-return-product.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReturnProductService {
  constructor(private prisma: PrismaService) {}

  create(createReturnProductDto: CreateReturnProductDto) {
    return 'This action adds a new returnProduct';
  }

  private buildWhereCondition(
    status: { vendor_status?: string; admin_status?: string },
    search?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = { ...status };

    if (search) {
      const trimmedSearch = search.trim();
      where.OR = [
        { order: { user: { name: { contains: trimmedSearch, mode: 'insensitive' } } } },
        { order: { store: { name: { contains: trimmedSearch, mode: 'insensitive' } } } },
        { order: { id: { contains: trimmedSearch, mode: 'insensitive' } } }
      ];
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    return where;
  }

  // return new return product details with customer Name, item id, vendors name, date requested, reason, additional info, vendor's decision, decision, actions
  async findAllNewReturnItem(
    search?: string, 
    startDate?: string, 
    endDate?: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const where = this.buildWhereCondition(
        { vendor_status: 'approved', admin_status: 'pending' },
        search,
        startDate,
        endDate
      );

      // Reset pagination to first page if searching
      const currentPage = search ? 1 : page;

      // Get total count for pagination
      const total_items_count = await this.prisma.orderReturn.count({ where });

      const returnRequests = await this.prisma.orderReturn.findMany({
        where,
        skip: (Number(currentPage) - 1) * Number(limit),
        take: Number(limit),
        orderBy: {
          created_at: 'desc',
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              store: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          order_return_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  product_files: {
                    select: {
                      file: true,
                      file_alt: true,
                    },
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  price: true,
                  variant_files: {
                    select: {
                      file: true,
                      file_alt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const formattedReturns = returnRequests.map((returnRequest) => ({
        return_id: returnRequest.id,
        customer_name: returnRequest.order?.user?.name || 'N/A',
        customer_email: returnRequest.order?.user?.email,
        store_name: returnRequest.order?.store?.name || 'N/A',
        order_id: returnRequest.order_id,
        items: returnRequest.order_return_items.map((item) => ({
          product_name: item.product?.name,
          product_id: item.product_id,
          price: item.variant?.price || item.product?.price,
          quantity: item.quantity || 1,
          total_price: (Number(item.variant?.price) || Number(item.product?.price) || 0) * (item.quantity || 1),
          images: item.variant?.variant_files || item.product?.product_files,
        })),
        date_requested: returnRequest.created_at,
        reason: returnRequest.reason || 'No reason provided',
        additional_info: returnRequest.additional_info || 'No additional info provided',
        admin_status: returnRequest.admin_status,
        vendor_status: returnRequest.vendor_status,
      }));

      return {
        success: true,
        pagination: {
          current_page: Number(currentPage),
          total_pages: Math.ceil(total_items_count / Number(limit)),
          total_items: total_items_count,
        },
        data: formattedReturns,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Add the findOne method to retrieve specific return request by ID
  async findOne(id: string) {
    try {
      const returnRequest = await this.prisma.orderReturn.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone_number: true,
                  address: true,
                },
              },
              store: {
                select: {
                  id: true,
                  name: true,
                  phone_number: true,
                  address: true,
                },
              },
              order_items: {
                select: {
                  product_id: true,
                  variant_id: true,
                  quantity: true,
                },
              },
            },
          },
          order_return_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  product_files: {
                    select: {
                      file: true,
                      file_alt: true,
                    },
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  price: true,
                  variant_files: {
                    select: {
                      file: true,
                      file_alt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!returnRequest) {
        return {
          success: false,
          message: 'Return request not found',
        };
      }

      const formattedReturn = {
        return_id: returnRequest.id,
        // Customer Details
        customer: {
          name: returnRequest.order?.user?.name || 'N/A',
          email: returnRequest.order?.user?.email,
          phone: returnRequest.order?.user?.phone_number,
          address: returnRequest.order?.user?.address,
        },
        // Store Details
        store: {
          name: returnRequest.order?.store?.name || 'N/A',
          phone: returnRequest.order?.store?.phone_number,
          address: returnRequest.order?.store?.address,
        },
        // Order Detail
        order_id: returnRequest.order_id,
        items: returnRequest.order_return_items.map((item) => {
          // Find matching order item to get original quantity
          const orderItem = returnRequest.order?.order_items.find(
            (orderItem) =>
              orderItem.product_id === item.product_id &&
              orderItem.variant_id === item.variant_id,
          );

          return {
            product_name: item.product?.name,
            product_id: item.product_id,
            price: item.variant?.price || item.product?.price,
            ordered_quantity: orderItem?.quantity || 1, // Original order quantity
            images: item.variant?.variant_files || item.product?.product_files,
            total_price:
              (Number(item.variant?.price) ||
                Number(item.product?.price) ||
                0) * (orderItem?.quantity || 0),
          };
        }),
        // Return Details
        date_requested: returnRequest.created_at,
        reason: returnRequest.reason || 'No reason provided',
        additional_info:
          returnRequest.additional_info || 'No additional info provided',
        admin_status: returnRequest.admin_status,
        vendor_status: returnRequest.vendor_status,
      };

      return {
        success: true,
        data: formattedReturn,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // Add approve/decline functionality
  async updateReturnStatus(returnId: string, status: 'approved' | 'rejected') {
    try {
      // First check if return request exists
      const returnRequest = await this.prisma.orderReturn.findUnique({
        where: { id: returnId },
      });

      if (!returnRequest) {
        return {
          success: false,
          message: 'Return request not found',
        };
      }

      // Update the return status
      const updatedReturn = await this.prisma.orderReturn.update({
        where: { id: returnId },
        data: {
          admin_status: status,
          updated_at: new Date(),
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // You could add email notification logic here
      // const userEmail = updatedReturn.order?.user?.email;
      // if (userEmail) {
      //   await this.notificationService.sendReturnStatusUpdateEmail(userEmail, status);
      // }

      return {
        success: true,
        message: `Return request ${status} successfully`,
        data: updatedReturn,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  // get all data whose admin_status is approved
  async reslovedReturn(
    search?: string, 
    startDate?: string, 
    endDate?: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const where = this.buildWhereCondition(
        { admin_status: 'approved' },
        search,
        startDate,
        endDate
      );

      // Reset pagination to first page if searching
      const currentPage = search ? 1 : page;

      // Get total count for pagination
      const total_items_count = await this.prisma.orderReturn.count({ where });

      const returnRequests = await this.prisma.orderReturn.findMany({
        where,
        skip: (Number(currentPage) - 1) * Number(limit),
        take: Number(limit),
        orderBy: {
          created_at: 'desc',
        },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              store: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          order_return_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  product_files: {
                    select: {
                      file: true,
                      file_alt: true,
                    },
                  },
                },
              },
              variant: {
                select: {
                  id: true,
                  price: true,
                  variant_files: {
                    select: {
                      file: true,
                      file_alt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const formattedReturns = returnRequests.map((returnRequest) => ({
        return_id: returnRequest.id,
        customer_name: returnRequest.order?.user?.name || 'N/A',
        customer_email: returnRequest.order?.user?.email,
        store_name: returnRequest.order?.store?.name || 'N/A',
        order_id: returnRequest.order_id,
        items: returnRequest.order_return_items.map((item) => ({
          product_name: item.product?.name,
          product_id: item.product_id,
          price: item.variant?.price || item.product?.price,
          quantity: item.quantity || 1,
          total_price: (Number(item.variant?.price) || Number(item.product?.price) || 0) * (item.quantity || 1),
          images: item.variant?.variant_files || item.product?.product_files,
        })),
        date_requested: returnRequest.created_at,
        reason: returnRequest.reason || 'No reason provided',
        additional_info: returnRequest.additional_info || 'No additional info provided',
        admin_status: returnRequest.admin_status,
        vendor_status: returnRequest.vendor_status,
      }));

      return {
        success: true,
        pagination: {
          current_page: Number(currentPage),
          total_pages: Math.ceil(total_items_count / Number(limit)),
          total_items: total_items_count,
        },
        data: formattedReturns,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
