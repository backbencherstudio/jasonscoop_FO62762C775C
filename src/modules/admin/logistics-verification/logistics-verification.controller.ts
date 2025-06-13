import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Post,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
  UploadedFile,
  Body,
  UploadedFiles,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { LogisticsVerificationService } from './logistics-verification.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guard/role/roles.guard';
import { Role } from '../../../common/guard/role/role.enum';
import { Roles } from '../../../common/guard/role/roles.decorator';
import { VerifyLogisticsDto } from './dto/verify-logistics.dto';
import { ApproveDocumentDto } from './dto/approve-document.dto';
import { Request as ExpressRequest } from 'express';
import { UploadDocumentsDto } from './dto/upload-documents.dto';
import { QueryVerificationDto } from './dto/query-verification.dto';

@ApiBearerAuth()
@ApiTags('Logistics Verification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logistics-verification')
export class LogisticsVerificationController {
  constructor(
    private readonly logisticsVerificationService: LogisticsVerificationService,
  ) {}

  /**
   * 🚀 [Step 1] Fetch logistics verification requests (Pending & Approved)
   */
  @Get()
  @ApiOperation({ summary: 'Get all logistics verification requests' })
  async getLogisticsVerifications(@Query() queryDto: QueryVerificationDto) {
    try {
      // console.log('📢 [Controller] Received query params:', queryDto);

      // Keep existing parameters and add date handling
      const {
        role = null,
        q = '',
        page = 1,
        limit = 10,
        start_date,
        end_date,
      } = queryDto;

      return this.logisticsVerificationService.getLogisticsVerifications({
        role,
        q,
        page: Number(page),
        limit: Number(limit),
        start_date,
        end_date,
      });
    } catch (error) {
      // console.error('❌ [Controller] Error:', error.message);
      return { success: false, message: error.message };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get logistics verification details' })
  async findOne(@Param('id') id: string) {
    return this.logisticsVerificationService.findOne(id);
  }

  /**
   * 🚀 NEW FEATURE: Multiple File Upload API
   */
  @Roles(Role.LOGISTIC_AGENT, Role.LOGISTIC_MANAGER)
  @Patch('upload')
  @ApiOperation({ summary: 'Upload multiple documents for verification' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 3)) // Ensure we get max 3 files
  async uploadDocuments(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDocumentsDto: UploadDocumentsDto,
  ) {
    // 🛠️ Ensure 'types' is parsed correctly from JSON string
    if (typeof uploadDocumentsDto.types === 'string') {
      try {
        uploadDocumentsDto.types = JSON.parse(uploadDocumentsDto.types);
      } catch (error) {
        // console.error('❌ [Step 2] JSON Parsing Error:', error.message);
        throw new BadRequestException('Invalid JSON format for types');
      }
    }

    // 🛠️ Validate that each file has a corresponding type
    if (files.length !== 3 || uploadDocumentsDto.types.length !== 3) {
      // console.error(
      //   '❌ [Step 3] Validation failed! Files:',
      //   files.length,
      //   'Types:',
      //   uploadDocumentsDto.types.length,
      // );
      throw new BadRequestException(
        'You must provide exactly 3 files with their corresponding types.',
      );
    }

    return this.logisticsVerificationService.uploadDocuments(
      req.user.userId,
      uploadDocumentsDto,
      files,
    );
  }

  /**
   * 🚀 [Step 2] Approve a document
   */
  @Roles(Role.ADMIN)
  @Patch(':id/document')
  @ApiOperation({ summary: 'Approve a document for verification' })
  async approveDocument(
    @Param('id') id: string,
    @Body() approveDocumentDto: ApproveDocumentDto,
  ) {
    return this.logisticsVerificationService.approveDocument(
      id,
      approveDocumentDto,
    );
  }

  /**
   * 🚀 [Step 3] Reject a document (Deletes file from MinIO & DB)
   */
  @Roles(Role.ADMIN)
  @Delete(':id/document')
  @ApiOperation({ summary: 'Reject a document for verification' })
  async rejectDocument(
    @Param('id') id: string,
    @Body() approveDocumentDto: ApproveDocumentDto,
  ) {
    return this.logisticsVerificationService.rejectDocument(
      id,
      approveDocumentDto,
    );
  }

  /**
   * 🚀 [Step 4] Final verification of logistics user
   */
  @Patch(':id/verify')
  @ApiOperation({ summary: 'Final verification of logistics user' })
  async verifyLogistics(@Param('id') id: string) {
    return this.logisticsVerificationService.verifyLogistics(id);
  }
}
