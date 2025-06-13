import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { 
  CreateTransactionReportDto, 
  CreateOrderReportDto,
  PreviewTransactionReportDto,
  PreviewOrderReportDto 
} from './dto/create-report.dto';
import * as puppeteer from 'puppeteer';
import { transactionReportTemplate } from './templates/transaction-report.template';
import { orderReportTemplate } from './templates/order-report.template';
import * as handlebars from 'handlebars';
import { format } from 'date-fns';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { ReportGenerationException } from './exceptions/report.exception';
import { 
  TransactionReportDownloadResponseDto,
  OrderReportDownloadResponseDto
} from './dto/report-response.dto';
import { ReportType, ReportStatus } from './types/report.types';
import { ReportListItemDto, ReportListResponseDto } from './dto/report-list.dto';
import { ReportFilterDto, ReportTypeFilter, ReportSortBy, SortOrder } from './dto/report-filter.dto';
import { ReportListException } from './exceptions/report-list.exception';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  // Preview Methods
  async previewTransactionPDF(dto: PreviewTransactionReportDto): Promise<Buffer> {
    try {
      // console.log('13. Service: Starting preview generation');
      // console.log('14. Service: Input DTO:', dto);
      
      const data = await this.generateTransactionReport(dto);
      // console.log('15. Service: Got transaction data, count:', data?.length);
      
      if (!data || data.length === 0) {
        // console.log('16. Service: No data found');
        throw new ReportGenerationException('No data found for the specified date range');
      }

      // console.log('17. Service: Compiling template');
      const html = this.compileTemplate(transactionReportTemplate, {
        dateFrom: format(new Date(dto.date_from), 'yyyy-MM-dd'),
        dateTo: dto.date_to ? format(new Date(dto.date_to), 'yyyy-MM-dd') : format(new Date(dto.date_from), 'yyyy-MM-dd'),
        transactions: data
      });
      
      // console.log('18. Service: Generating PDF');
      const pdfBuffer = await this.generatePDF(html);
      // console.log('19. Service: PDF generated, length:', pdfBuffer?.length);
      
      return pdfBuffer;
    } catch (error) {
      // console.log('20. Service: Error caught:', error.message);
      throw error;
    }
  }

  async previewOrderPDF(dto: PreviewOrderReportDto): Promise<Buffer> {
    try {
      // console.log('Service: Previewing Order Report');
      const data = await this.generateOrderReport(dto);
      
      if (!data || data.length === 0) {
        throw new ReportGenerationException('No data found for the specified date range');
      }

      const html = this.compileTemplate(orderReportTemplate, {
        dateFrom: format(new Date(dto.date_from), 'yyyy-MM-dd'),
        dateTo: dto.date_to ? format(new Date(dto.date_to), 'yyyy-MM-dd') : format(new Date(dto.date_from), 'yyyy-MM-dd'),
        orders: data
      });
      
      return await this.generatePDF(html);
    } catch (error) {
      // console.error('Preview Order Error:', error);
      throw error;
    }
  }

  // Updated Download Methods
  async generateTransactionPDF(dto: CreateTransactionReportDto): Promise<TransactionReportDownloadResponseDto> {
    try {
      // console.log('Service: Generating Transaction Report for Download');
      const data = await this.generateTransactionReport(dto);
      
      if (!data || data.length === 0) {
        throw new ReportGenerationException('No data found for the specified date range');
      }

      const html = this.compileTemplate(transactionReportTemplate, {
        dateFrom: format(new Date(dto.date_from), 'yyyy-MM-dd'),
        dateTo: dto.date_to ? format(new Date(dto.date_to), 'yyyy-MM-dd') : format(new Date(dto.date_from), 'yyyy-MM-dd'),
        transactions: data
      });
      
      const pdfBuffer = await this.generatePDF(html);
      
      // Save report and create DB entry
      const fileName = `transaction-report-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.pdf`;
      const fileUrl = await this.saveReport(fileName, pdfBuffer);
      
      // Create DB entry with correct schema fields
      const reportEntry = await this.prisma.transactionReport.create({
        data: {
          transaction_id: data[0].transaction_id,
          transaction_date: new Date(data[0].transaction_date),
          date_from: new Date(dto.date_from),
          date_to: dto.date_to ? new Date(dto.date_to) : new Date(dto.date_from),
          format: dto.format,
          file_url: fileUrl,
          status: 1,
          report_type: 1,
          created_at: new Date(),
          user_id: data[0].user_id
        }
      });
      
      return {
        success: true,
        data: {
          file_url: fileUrl,
          report_id: reportEntry.id,
          format: dto.format,
          generated_at: reportEntry.created_at,
          transaction_count: data.length
        }
      };
    } catch (error) {
      // console.error('Generate Transaction Error:', error);
      if (error instanceof ReportGenerationException) {
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
      throw new InternalServerErrorException('Failed to generate report');
    }
  }

  async generateOrderPDF(dto: CreateOrderReportDto): Promise<OrderReportDownloadResponseDto> {
    try {
      // console.log('Service: Generating Order Report for Download');
      const data = await this.generateOrderReport(dto);
      
      if (!data || data.length === 0) {
        throw new ReportGenerationException('No data found for the specified date range');
      }

      const html = this.compileTemplate(orderReportTemplate, {
        dateFrom: format(new Date(dto.date_from), 'yyyy-MM-dd'),
        dateTo: dto.date_to ? format(new Date(dto.date_to), 'yyyy-MM-dd') : format(new Date(dto.date_from), 'yyyy-MM-dd'),
        orders: data
      });
      
      const pdfBuffer = await this.generatePDF(html);
      
      // Save report and create DB entry
      const fileName = `order-report-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.pdf`;
      const fileUrl = await this.saveReport(fileName, pdfBuffer);
      
      // Create DB entry with correct schema fields
      const reportEntry = await this.prisma.orderReport.create({
        data: {
          order_id: data[0].order_id,
          order_date: new Date(data[0].order_date_time),
          date_from: new Date(dto.date_from),
          date_to: dto.date_to ? new Date(dto.date_to) : new Date(dto.date_from),
          format: dto.format,
          file_url: fileUrl,
          status: 1,
          report_type: 1,
          created_at: new Date(),
          user_id: data[0].customer_id
        }
      });
      
      return {
        success: true,
        data: {
          file_url: fileUrl,
          report_id: reportEntry.id,
          format: dto.format,
          generated_at: reportEntry.created_at,
          order_count: data.length
        }
      };
    } catch (error) {
      // console.error('Generate Order Error:', error);
      if (error instanceof ReportGenerationException) {
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
      throw new InternalServerErrorException('Failed to generate report');
    }
  }

  // Existing helper methods remain unchanged
  private async generatePDF(html: string): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html);
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      await browser.close();
      return Buffer.from(pdf);
    } catch (error) {
      throw new ReportGenerationException('Failed to generate PDF');
    }
  }

  private compileTemplate(template: string, data: any): string {
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }

  private async saveReport(fileName: string, buffer: Buffer): Promise<string> {
    try {
      
      const path = `reports/${fileName}`;
      
      await SojebStorage.put(path, buffer);
      
      return SojebStorage.url(path);
    } catch (error) {
      throw new ReportGenerationException('Failed to save report');
    }
  }

  // Existing data fetching methods remain unchanged
  async generateTransactionReport(dto: CreateTransactionReportDto | PreviewTransactionReportDto) {
    // console.log('21. Service: Starting data fetch');
    // console.log('22. Service: Query params:', {
    //   date_from: dto.date_from,
    //   date_to: dto.date_to
    // });
    
    try {
      // Create start of day
      const dateFrom = new Date(dto.date_from);
      dateFrom.setHours(0, 0, 0, 0);

      // Create end of day or use date_to
      const dateTo = dto.date_to 
        ? new Date(dto.date_to).setHours(23, 59, 59, 999)
        : new Date(dto.date_from).setHours(23, 59, 59, 999);

      // console.log('23. Service: Parsed dates:', { 
      //   dateFrom,
      //   dateTo: new Date(dateTo),
      //   isSingleDate: !dto.date_to,
      //   dateFromISO: dateFrom.toISOString(),
      //   dateToISO: new Date(dateTo).toISOString()
      // });

      const transactions = await this.prisma.paymentTransaction.findMany({
        where: {
          created_at: {
            gte: dateFrom,
            lte: new Date(dateTo),
          },
        },
        include: {
          order: true,
          store: true,
          user: true,
        },
      });

      // console.log('24. Service: Found raw transactions:', transactions.length);

      // Format the data for template
      const formattedData = transactions.map(tx => ({
        transaction_id: tx.id,
        transaction_date: format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
        transaction_status: tx.status,
        transaction_amount: tx.amount,
        transaction_provider: tx.provider,
        invoice_number: tx.order?.invoice_number || '-',
        order_date_time: tx.order?.order_date_time ? format(new Date(tx.order.order_date_time), 'yyyy-MM-dd HH:mm:ss') : '-',
        total_amount: tx.order?.total_amount || tx.amount,
        store_name: tx.store?.name || '-',
        customer_name: tx.user?.name || '-',
        customer_email: tx.user?.email || '-',
        user_id: tx.user?.id
      }));

      // console.log('25. Service: Formatted transactions:', formattedData.length);
      return formattedData;
    } catch (error) {
      // console.log('26. Service: Database error:', error.message);
      throw error;
    }
  }

  async generateOrderReport(dto: CreateOrderReportDto | PreviewOrderReportDto) {
    try {
      // Convert string dates to Date objects
      const dateFrom = new Date(dto.date_from);
      dateFrom.setHours(0, 0, 0, 0);

      const dateTo = dto.date_to 
        ? new Date(dto.date_to).setHours(23, 59, 59, 999)
        : new Date(dto.date_from).setHours(23, 59, 59, 999);

      // console.log('Order Report Dates:', {
      //   dateFrom,
      //   dateTo: new Date(dateTo),
      //   rawDateFrom: dto.date_from,
      //   rawDateTo: dto.date_to
      // });

      const orders = await this.prisma.order.findMany({
        where: {
          order_date_time: {
            gte: dateFrom,
            lte: new Date(dateTo),
          },
        },
        include: {
          user: true,
          store: true,
          order_items: {
            include: {
              product: true,
            },
          },
        },
      });

      // console.log(`Found ${orders.length} orders`);

      const formattedData = orders.map(order => ({
        order_id: order.id,
        order_date_time: order.order_date_time,
        invoice_number: order.invoice_number,
        total_amount: order.total_amount,
        customer_id: order.user_id,
        customer_name: order.user?.name || '-',
        customer_email: order.user?.email || '-',
        store_name: order.store?.name || '-',
        items: order.order_items.map(item => ({
          product_id: item.product_id,
          product_name: item.product?.name,
          quantity: item.quantity,
          product_price: item.price
        }))
      }));

      return formattedData;
    } catch (error) {
      // console.error('Order Report Error:', {
      //   message: error.message,
      //   stack: error.stack
      // });
      throw error;
    }
  }

  async getAllReports({ filters }: { filters: ReportFilterDto }): Promise<ReportListResponseDto> {
    try {
      // console.log('Getting reports with filters:', filters);

     console.log("Query params:", filters.q);

      // Build base queries for both report types
      const transactionWhere: any = {};
      const orderWhere: any = {};

      // Add date range filters if provided
      if (filters.startDate || filters.endDate) {
        const dateFilter = {};
        
        if (filters.startDate) {
          dateFilter['gte'] = new Date(filters.startDate + 'T00:00:00.000Z');
        }
        
        if (filters.endDate) {
          dateFilter['lte'] = new Date(filters.endDate + 'T23:59:59.999Z');
        }

        transactionWhere.date_from = dateFilter;
        orderWhere.date_from = dateFilter;
      }

      // Add search condition if q exists
     // Add search condition if q exists
if (filters.q) {
  const searchQuery = filters.q.trim().toLowerCase(); // Normalize query
  
  // Check if the query is a date
  let dateQueryCondition = {};
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format: YYYY-MM-DD
  if (dateRegex.test(searchQuery)) {
    const searchDate = new Date(filters.q);
    dateQueryCondition = {
      OR: [
        { date_from: { gte: searchDate } },
        { date_to: { lte: searchDate } }
      ]
    };
  }

  // Build the search condition
  const searchCondition = {
    OR: [
      { file_url: { contains: searchQuery, mode: 'insensitive' } },
      { format: { contains: searchQuery, mode: 'insensitive' } },
      { name: { contains: searchQuery, mode: 'insensitive' } }, // Include name in search
      { report_type: { contains: searchQuery, mode: 'insensitive' } },
      ...Object.keys(dateQueryCondition).length ? [dateQueryCondition] : []
    ]
  };

  // Apply search conditions
  Object.assign(transactionWhere, searchCondition);
  Object.assign(orderWhere, searchCondition);
}


      // Handle sorting
      let orderBy: any = { created_at: filters.order || 'desc' };

      if (filters.sortBy && filters.sortBy !== ReportSortBy.DATE) {
        switch (filters.sortBy) {
          case ReportSortBy.TYPE:
            orderBy = { report_type: filters.order };
            break;
          case ReportSortBy.FORMAT:
            orderBy = { format: filters.order };
            break;
        }
      }

      // Build pagination
      const query_condition: any = {};
      
      // cursor based pagination
      if (filters.cursor) {
        query_condition.cursor = {
          id: filters.cursor,
        };
        query_condition.skip = 1;
      }

      // offset based pagination
      if (filters.page) {
        query_condition.skip = (Number(filters.page) - 1) * Number(filters.limit);
      }

      if (filters.limit) {
        query_condition.take = Number(filters.limit);
      }

      // Fetch reports based on type filter
      let transactionReports = [];
      let orderReports = [];
      let total_transaction_count = 0;
      let total_order_count = 0;

      if (filters.type !== ReportTypeFilter.ORDER) {
        [transactionReports, total_transaction_count] = await Promise.all([
          this.prisma.transactionReport.findMany({
            where: transactionWhere,
            orderBy,
            ...query_condition,
          }),
          this.prisma.transactionReport.count({
            where: transactionWhere,
          })
        ]);
      }

      if (filters.type !== ReportTypeFilter.TRANSACTION) {
        [orderReports, total_order_count] = await Promise.all([
          this.prisma.orderReport.findMany({
            where: orderWhere,
            orderBy,
            ...query_condition,
          }),
          this.prisma.orderReport.count({
            where: orderWhere,
          })
        ]);
      }

      // Format reports
      const formattedTransactionReports = transactionReports.map(report => ({
        name: 'Transaction Reports',
        date: this.formatReportDate(report.date_from, report.date_to),
        format: report.format,
        file_url: report.file_url
      }));

      const formattedOrderReports = orderReports.map(report => ({
        name: 'All Orders List',
        date: this.formatReportDate(report.date_from, report.date_to),
        format: report.format,
        file_url: report.file_url
      }));

      // Combine and sort if needed
      const allReports = [...formattedTransactionReports, ...formattedOrderReports];
      const total_items = total_transaction_count + total_order_count;

      // Calculate pagination
      const pagination = {
        current_page: Number(filters.page),
        total_pages: Math.ceil(total_items / Number(filters.limit)),
        total_items: total_items,
        cursor: filters.cursor
      };

      return {
        success: true,
        message: 'Reports retrieved successfully',
        pagination,
        data: allReports
      };
    } catch (error) {
      // console.error('Get All Reports Error:', {
      //   message: error.message,
      //   stack: error.stack,
      //   filters
      // });

      if (error instanceof ReportListException) {
        throw error;
      }

      throw new ReportListException(
        error.message || 'Failed to retrieve reports'
      );
    }
  }

  // Helper method to format dates
  private formatReportDate(dateFrom: Date, dateTo?: Date | null): string {
    const fromDate = format(dateFrom, 'yyyy-MM-dd');
    
    // If dateTo exists and is different from dateFrom
    if (dateTo && format(dateTo, 'yyyy-MM-dd') !== fromDate) {
      return `${fromDate} to ${format(dateTo, 'yyyy-MM-dd')}`;
    }
    
    return fromDate;
  }
} 