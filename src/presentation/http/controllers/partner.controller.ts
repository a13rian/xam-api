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
import { Roles } from '../../../shared/decorators/roles.decorator';
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
    const result = await this.commandBus.execute(
      new RegisterPartnerCommand(
        user.id,
        dto.type,
        dto.businessName,
        dto.description,
      ),
    );

    return await this.queryBus.execute(new GetPartnerQuery(result.id));
  }

  @Get('me')
  async getMyPartner(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PartnerResponseDto> {
    const partner = await this.queryBus.execute(new GetMyPartnerQuery(user.id));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return partner;
  }

  @Get(':id')
  async getPartner(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    return await this.queryBus.execute(new GetPartnerQuery(id));
  }

  @Get('me/documents')
  async listMyDocuments(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ items: DocumentResponseDto[] }> {
    const partner = await this.queryBus.execute(new GetMyPartnerQuery(user.id));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return await this.queryBus.execute(
      new ListPartnerDocumentsQuery(partner.id, user.id),
    );
  }

  @Post('me/documents')
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadDocumentDto,
  ): Promise<{ id: string }> {
    const partner = await this.queryBus.execute(new GetMyPartnerQuery(user.id));
    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }
    return await this.commandBus.execute(
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
  @Roles('super_admin', 'admin')
  async listPending(
    @Query() query: ListPartnersQueryDto,
  ): Promise<PendingPartnersResponseDto> {
    return await this.queryBus.execute(
      new ListPendingPartnersQuery(query.page, query.limit),
    );
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  async getPartner(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PartnerResponseDto> {
    return await this.queryBus.execute(new GetPartnerQuery(id));
  }

  @Post(':id/approve')
  @HttpCode(200)
  @Roles('super_admin', 'admin')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PartnerResponseDto> {
    await this.commandBus.execute(new ApprovePartnerCommand(id, user.id));
    return await this.queryBus.execute(new GetPartnerQuery(id));
  }

  @Post(':id/reject')
  @HttpCode(200)
  @Roles('super_admin', 'admin')
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
  @Roles('super_admin', 'admin')
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
  @Roles('super_admin', 'admin')
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
