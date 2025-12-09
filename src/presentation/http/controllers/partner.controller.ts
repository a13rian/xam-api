import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  RegisterPartnerDto,
  RejectPartnerDto,
  PartnerResponseDto,
  PendingPartnersResponseDto,
  ListPartnersQueryDto,
} from '../dto/partner';
import { UploadDocumentDto } from '../dto/partner/upload-document.dto';
import { DocumentResponseDto } from '../dto/partner/document-response.dto';
import {
  RegisterPartnerCommand,
  ApprovePartnerCommand,
  RejectPartnerCommand,
  UploadDocumentCommand,
  ApproveDocumentCommand,
  RejectDocumentCommand,
} from '../../../core/application/partner/commands';
import { RegisterPartnerResult } from '../../../core/application/partner/commands/register-partner/register-partner.handler';
import {
  GetPartnerQuery,
  GetMyPartnerQuery,
  ListPendingPartnersQuery,
  ListPartnerDocumentsQuery,
} from '../../../core/application/partner/queries';

@Controller('partners')
export class PartnerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('register')
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterPartnerDto,
  ): Promise<PartnerResponseDto> {
    const result = await this.commandBus.execute<
      RegisterPartnerCommand,
      RegisterPartnerResult
    >(
      new RegisterPartnerCommand(
        user.id,
        dto.type,
        dto.description,
        // Business-specific fields
        dto.businessName,
        dto.taxId,
        dto.businessLicense,
        dto.companySize,
        dto.website,
        dto.socialMedia,
        dto.establishedDate ? new Date(dto.establishedDate) : undefined,
        // Individual-specific fields
        dto.displayName,
        dto.idCardNumber,
        dto.specialization,
        dto.yearsExperience,
        dto.certifications,
        dto.portfolio,
        dto.personalBio,
      ),
    );

    return await this.queryBus.execute<GetPartnerQuery, PartnerResponseDto>(
      new GetPartnerQuery(result.id),
    );
  }

  @Get('me')
  async getMyPartner(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PartnerResponseDto> {
    const partner = await this.queryBus.execute<
      GetMyPartnerQuery,
      PartnerResponseDto | null
    >(new GetMyPartnerQuery(user.id));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return partner;
  }

  @Get(':id')
  async getPartner(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    return await this.queryBus.execute<GetPartnerQuery, PartnerResponseDto>(
      new GetPartnerQuery(id),
    );
  }

  @Get('me/documents')
  async listMyDocuments(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: DocumentResponseDto[] }> {
    const partner = await this.queryBus.execute<
      GetMyPartnerQuery,
      PartnerResponseDto | null
    >(new GetMyPartnerQuery(user.id));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return await this.queryBus.execute<
      ListPartnerDocumentsQuery,
      { items: DocumentResponseDto[] }
    >(new ListPartnerDocumentsQuery(partner.id, user.id));
  }

  @Post('me/documents')
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadDocumentDto,
  ): Promise<{ id: string }> {
    const partner = await this.queryBus.execute<
      GetMyPartnerQuery,
      PartnerResponseDto | null
    >(new GetMyPartnerQuery(user.id));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return await this.commandBus.execute<UploadDocumentCommand, { id: string }>(
      new UploadDocumentCommand(partner.id, user.id, dto.type, dto.url),
    );
  }
}

@Controller('admin/partners')
export class AdminPartnerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('pending')
  @RequirePermissions(PERMISSIONS.PARTNER.LIST)
  async listPending(
    @Query() query: ListPartnersQueryDto,
  ): Promise<PendingPartnersResponseDto> {
    return await this.queryBus.execute(
      new ListPendingPartnersQuery(query.page, query.limit),
    );
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.PARTNER.READ)
  async getPartner(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    return await this.queryBus.execute(new GetPartnerQuery(id));
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER.APPROVE)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PartnerResponseDto> {
    await this.commandBus.execute(new ApprovePartnerCommand(id, user.id));
    return await this.queryBus.execute(new GetPartnerQuery(id));
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER.REJECT)
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RejectPartnerDto,
  ): Promise<PartnerResponseDto> {
    await this.commandBus.execute(
      new RejectPartnerCommand(id, user.id, dto.reason),
    );
    return await this.queryBus.execute(new GetPartnerQuery(id));
  }

  @Post('documents/:documentId/approve')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER_DOCUMENT.APPROVE)
  async approveDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new ApproveDocumentCommand(documentId, user.id),
    );
  }

  @Post('documents/:documentId/reject')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER_DOCUMENT.REJECT)
  async rejectDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RejectPartnerDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new RejectDocumentCommand(documentId, user.id, dto.reason),
    );
  }
}
