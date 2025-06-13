import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import { VerifyLogisticsDto } from './dto/verify-logistics.dto';
import { ApproveDocumentDto } from './dto/approve-document.dto';
import { UploadDocumentsDto } from './dto/upload-documents.dto';
import { QueryVerificationDto } from './dto/query-verification.dto';
import { User, UserDocument } from '@prisma/client';

@Injectable()
export class LogisticsVerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🚀 [Step 1] Fetch logistics verification requests (Pending & Approved)
   */
  async getLogisticsVerifications({
    role,
    q,
    start_date,
    end_date,
    cursor,
    limit = 10,
    page = 1,
  }: QueryVerificationDto) {
    try {
      // console.log('Service received dates:', { start_date, end_date });
      // console.log('📢 [Step 1] Fetching logistics verification users...');
      // console.log('🔍 Start Date:', start_date);
      // console.log('🔍 End Date:', end_date);
      // Base where condition
      const where_condition: any = {
        type: role ? role : { in: ['logistic_agent', 'logistic_manager'] },
      };

      // Enhanced date filtering logic
      if (start_date || end_date) {
        where_condition.created_at = {};

        // Case 1: Single date filtering
        if (start_date && !end_date) {
          // Get start and end of the given date
          const startOfDay = new Date(start_date + 'T00:00:00.000Z');
          const endOfDay = new Date(start_date + 'T23:59:59.999Z');

          where_condition.created_at = {
            gte: startOfDay,
            lte: endOfDay,
          };
        }
        // Case 2: Date range filtering
        else if (start_date && end_date) {
          where_condition.created_at = {
            gte: new Date(start_date + 'T00:00:00.000Z'),
            lte: new Date(end_date + 'T23:59:59.999Z'),
          };
        }
        // Case 3: Only end date (optional, same as single date)
        else if (!start_date && end_date) {
          const startOfDay = new Date(end_date + 'T00:00:00.000Z');
          const endOfDay = new Date(end_date + 'T23:59:59.999Z');

          where_condition.created_at = {
            gte: startOfDay,
            lte: endOfDay,
          };
        }
      }

      // Enhanced search condition
      if (q) {
        const trimContent = q.trim()
        where_condition.OR = [
          // Name search - partial match
          { name: { contains: trimContent, mode: 'insensitive' } },
          { first_name: { contains: trimContent, mode: 'insensitive' } },
          { last_name: { contains: trimContent, mode: 'insensitive' } },
          // Email search - partial match
          { email: { contains: trimContent, mode: 'insensitive' } },
          // Username search if available
          { username: { contains: trimContent, mode: 'insensitive' } },
        ];
      }

      const query_condition: any = {};

      // cursor based pagination
      if (cursor) {
        query_condition.cursor = {
          id: cursor,
        };
        query_condition.skip = 1;
      }

      // offset based pagination
      if (page) {
        query_condition.skip = (Number(page) - 1) * Number(limit);
      }

      if (limit) {
        query_condition.take = Number(limit);
      }

      // console.log('Where Condition:', JSON.stringify(where_condition, null, 2));

      // Get total count for pagination
      const total_items_count = await this.prisma.user.count({
        where: where_condition,
      });

      // Execute query
      const users = await this.prisma.user.findMany({
        where: where_condition,
        orderBy: { created_at: 'asc' },
        ...query_condition,
        include: {
          user_documents: true,
        },
      });

      // Format response data
      const formattedUsers = users.map(
        (user: User & { user_documents: UserDocument[] }) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          phone_number: user.phone_number,
          type: user.type,
          approved_at: user.approved_at,
          approval_status: user.approved_at ? 'approved' : 'pending',
          documents: user.user_documents.map((doc) => ({
            id:doc.id,
            approved_at: doc.approved_at,
            type: doc.type,
            file_url: SojebStorage.url(doc.file_path),
            file_name: doc.file_name,
          })),
        }),
      );

      // Prepare pagination info
      const pagination = {
        current_page: Number(page),
        total_pages: Math.ceil(total_items_count / Number(limit)),
        total_items: total_items_count,
        cursor: cursor,
      };

      return {
        success: true,
        pagination: pagination,
        data: formattedUsers,
      };
    } catch (error) {
      // console.error('❌ Error:', error.message);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 🚀 [Step 2] Fetch logistics user details
   */
  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id },
        include: { user_documents: true },
      });

      if (!user) throw new NotFoundException('Logistics user not found');

      return {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          phone_number: user.phone_number,
          type: user.type,
          approved_at: user.approved_at,
          approval_status: user.approved_at ? 'approved' : 'pending',
          documents: this.getUserDocuments(user.user_documents),
        },
      };
    } catch (error) {
      // console.error(
      //   `❌ [Step 2] Error fetching user details: ${error.message}`,
      // );
      return { success: false, message: error.message };
    }
  }

  /**
   * 📂 Helper Function: Generate file URLs for user documents
   * 🛠️ Now includes both file URL and file name for better frontend mapping.
   */
  private getUserDocuments(documents) {
    const documentData = {};
    documents.forEach((doc) => {
      documentData[doc.type] = {
        file_name: doc.file_name, // 📜 Add file name from DB
        file_url: SojebStorage.url(doc.file_path), // 🌍 Generate file URL
      };
    });
    return documentData;
  }

  /**
   * 🚀 NEW FEATURE: Upload Multiple Documents
   */
  async uploadDocuments(
    userId: string,
    uploadDocumentsDto: UploadDocumentsDto,
    files: Express.Multer.File[],
  ) {
    try {
      // 🛠️ Ensure each file is mapped to its corresponding type
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const type = uploadDocumentsDto.types[i];

        if (!file || !type) {
          // console.error(
          //   '❌ [Step 5] Mismatch between files and types at index',
          //   i,
          // );
          throw new BadRequestException('Mismatch between files and types');
        }

        // Define the file path in S3 (MinIO)
        const fileKey = `documents/${userId}/${file.originalname}`;

        // Store file in MinIO/S3
        await SojebStorage.put(fileKey, file.buffer);

        // Save file metadata in database
        const document = await this.prisma.userDocument.create({
          data: {
            user_id: userId,
            type,
            file_type: file.mimetype,
            file_path: fileKey,
            file_name: file.originalname,
          },
        });

        uploadedFiles.push(document);
      }

      return {
        success: true,
        message: 'Files uploaded successfully',
        data: uploadedFiles,
      };
    } catch (error) {
      // console.error('❌ [Step 10] Error Occurred:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 🚀 [Step 2] Approve a specific document for a logistics user
   */
  async approveDocument(id: string, approveDocumentDto: ApproveDocumentDto) {
    try {
      // 🔍 Find document by ID
      const document = await this.prisma.userDocument.findUnique({
        where: {
          id: approveDocumentDto.document_id,
          user_id: id,
        },
      });

      if (!document) {
        // console.error(`❌ [Step 2] Document not found!`);
        throw new NotFoundException('Document not found');
      }

      // ✅ Update document as approved
      const updatedDocument = await this.prisma.userDocument.update({
        where: {
          id: approveDocumentDto.document_id,
        },
        data: {
          approved_at: new Date(),
        },
      });

      return {
        success: true,
        message: 'Document approved successfully',
        data: updatedDocument,
      };
    } catch (error) {
      // console.error(`❌ [Step 2] Error approving document: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 🚀 [Step 3] Reject a specific document for a logistics user
   */
  async rejectDocument(id: string, approveDocumentDto: ApproveDocumentDto) {
    try {
      // 🔍 Find document by ID
      const document = await this.prisma.userDocument.findUnique({
        where: {
          id: approveDocumentDto.document_id,
          user_id: id,
        },
      });

      if (!document) {
        // console.error(`❌ [Step 3] Document not found!`);
        throw new NotFoundException('Document not found');
      }

      // 📂 Step 1: Delete file from storage
      const filePath = document.file_path;
      await SojebStorage.delete(filePath);

      // 📂 Step 2: Remove document entry from DB
      await this.prisma.userDocument.delete({
        where: {
          id: approveDocumentDto.document_id,
        },
      });

      return {
        success: true,
        message: 'Document rejected and deleted successfully',
      };
    } catch (error) {
      // console.error(`❌ [Step 3] Error rejecting document: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * 🚀 [Step 4] Final verification of a logistics user
   */
  async verifyLogistics(id: string) {
    try {
      // 🔍 Step 1: Check if user exists
      const user = await this.prisma.user.findFirst({
        where: {
          id,
          type: { in: ['logistic_agent', 'logistic_manager'] },
        },
      });

      if (!user) {
        // console.error(`❌ [Step 4] User ${id} not found.`);
        return { success: false, message: 'User not found' };
      }

      // 🔍 Step 2: Check if all documents are approved
      const documents = await this.prisma.userDocument.findMany({
        where: { user_id: id },
      });

      const hasUnapprovedDocuments = documents.some((doc) => !doc.approved_at);
      if (hasUnapprovedDocuments) {
        // console.error(`❌ [Step 4] User ${id} still has unapproved documents.`);
        return {
          success: false,
          message: 'All documents must be approved first',
        };
      }

      // ✅ Step 3: Update user approval status
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { approved_at: new Date() },
      });

      return {
        success: true,
        message: 'Logistics user verified successfully',
        // data: updatedUser,
      };
    } catch (error) {
      // console.error(
      //   '❌ [Step 4] Error verifying logistics user:',
      //   error.message,
      // );
      return { success: false, message: error.message };
    }
  }
}
