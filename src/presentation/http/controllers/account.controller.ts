import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import { AuthenticatedUser } from '../../../shared/interfaces/authenticated-user.interface';
import {
  RegisterAccountDto,
  RegisterAccountResponseDto,
  AccountResponseDto,
  SearchAccountsDto,
  SearchAccountsResponseDto,
  UpdateAccountProfileDto,
  AddGalleryImageDto,
  UpdateGalleryImageDto,
  ReorderGalleryDto,
  GalleryItemResponseDto,
  UploadGalleryImageDto,
} from '../dto/account';
import {
  UploadFileCommand,
  UploadFileResult,
} from '../../../core/application/storage/commands';
import {
  RegisterAccountCommand,
  ApproveAccountCommand,
  RejectAccountCommand,
  UpdateAccountProfileCommand,
  AddGalleryImageCommand,
  UpdateGalleryImageCommand,
  RemoveGalleryImageCommand,
  ReorderGalleryImagesCommand,
} from '../../../core/application/account/commands';
import { RegisterAccountResult } from '../../../core/application/account/commands/register-account/register-account.handler';
import {
  GetMyAccountQuery,
  GetMyAccountResult,
} from '../../../core/application/account/queries/get-my-account';
import {
  ListAccountsQuery,
  ListAccountsResult,
} from '../../../core/application/account/queries/list-accounts';
import {
  ListPendingAccountsQuery,
  ListPendingAccountsResult,
} from '../../../core/application/account/queries/list-pending-accounts';
import { SearchAccountsByLocationQuery } from '../../../core/application/account/queries/search-accounts-by-location';
import { GetAccountGalleryQuery } from '../../../core/application/account/queries/get-account-gallery';
import { AccountStatusEnum } from '../../../core/domain/account/value-objects/account-status.vo';
import { AccountTypeEnum } from '../../../core/domain/account/value-objects/account-type.vo';
import { Account } from '../../../core/domain/account/entities/account.entity';
import { AccountGallery } from '../../../core/domain/account/entities/account-gallery.entity';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('search')
  @Public()
  @ApiOperation({
    summary: 'Search accounts by location',
    description:
      'Find accounts within a specified radius from given coordinates, sorted by distance',
  })
  async searchByLocation(
    @Query() dto: SearchAccountsDto,
  ): Promise<SearchAccountsResponseDto> {
    return this.queryBus.execute(
      new SearchAccountsByLocationQuery(
        dto.latitude,
        dto.longitude,
        dto.radiusKm ?? 10,
        dto.search,
        dto.city,
        dto.district,
        dto.ward,
        dto.page ?? 1,
        dto.limit ?? 20,
      ),
    );
  }

  @Post('register')
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterAccountDto,
  ): Promise<RegisterAccountResponseDto> {
    const result = await this.commandBus.execute<
      RegisterAccountCommand,
      RegisterAccountResult
    >(
      new RegisterAccountCommand(
        user.id,
        dto.type,
        dto.displayName,
        // Individual fields
        dto.specialization,
        dto.yearsExperience,
        dto.certifications,
        dto.portfolio,
        dto.personalBio,
        // Business fields
        dto.businessName,
        dto.description,
        dto.taxId,
        dto.businessLicense,
        dto.companySize,
        dto.website,
        dto.socialMedia,
        dto.establishedDate ? new Date(dto.establishedDate) : undefined,
      ),
    );

    return result;
  }

  @Get('me')
  async getMyAccount(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AccountResponseDto> {
    const result = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    return result as AccountResponseDto;
  }

  @Patch('me/profile')
  @ApiOperation({
    summary: 'Update my account profile',
    description:
      'Update profile fields including media, contact, and professional info',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAccountProfileDto,
  ): Promise<AccountResponseDto> {
    // First get the account to find its ID
    const myAccount = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    const account = await this.commandBus.execute<
      UpdateAccountProfileCommand,
      Account
    >(new UpdateAccountProfileCommand(myAccount.id, dto));

    return account.toObject() as unknown as AccountResponseDto;
  }

  @Get('me/gallery')
  @ApiOperation({
    summary: 'Get my gallery images',
    description: 'Retrieve all gallery images for the current account',
  })
  async getMyGallery(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GalleryItemResponseDto[]> {
    const myAccount = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    const gallery = await this.queryBus.execute<
      GetAccountGalleryQuery,
      AccountGallery[]
    >(new GetAccountGalleryQuery(myAccount.id));

    return gallery.map(
      (item) => item.toObject() as unknown as GalleryItemResponseDto,
    );
  }

  @Post('me/gallery')
  @ApiOperation({
    summary: 'Add gallery image by URL',
    description: 'Add a new image to the account gallery using an image URL',
  })
  async addGalleryImage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddGalleryImageDto,
  ): Promise<GalleryItemResponseDto> {
    const myAccount = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    const gallery = await this.commandBus.execute<
      AddGalleryImageCommand,
      AccountGallery
    >(
      new AddGalleryImageCommand(
        myAccount.id,
        dto.imageUrl,
        dto.caption,
        dto.sortOrder,
      ),
    );

    return gallery.toObject() as unknown as GalleryItemResponseDto;
  }

  @Post('me/gallery/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload gallery image',
    description: 'Upload an image file directly to the account gallery',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
        caption: {
          type: 'string',
          description: 'Optional image caption',
        },
        sortOrder: {
          type: 'number',
          description: 'Sort order (default: 0)',
        },
      },
    },
  })
  async uploadGalleryImage(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /image\/(jpeg|png|gif|webp)$/i,
            skipMagicNumbersValidation: true,
          }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadGalleryImageDto,
  ): Promise<GalleryItemResponseDto> {
    // Get the account
    const myAccount = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    // Upload file to storage
    const uploadResult = await this.commandBus.execute<
      UploadFileCommand,
      UploadFileResult
    >(
      new UploadFileCommand(
        {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        myAccount.id,
        'account',
        'gallery',
      ),
    );

    // Create gallery entry with uploaded file URL
    const gallery = await this.commandBus.execute<
      AddGalleryImageCommand,
      AccountGallery
    >(
      new AddGalleryImageCommand(
        myAccount.id,
        uploadResult.url,
        dto.caption,
        dto.sortOrder,
        uploadResult.key,
      ),
    );

    return gallery.toObject() as unknown as GalleryItemResponseDto;
  }

  @Patch('me/gallery/:id')
  @ApiOperation({
    summary: 'Update gallery image',
    description: 'Update an existing gallery image caption or URL',
  })
  async updateGalleryImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') galleryId: string,
    @Body() dto: UpdateGalleryImageDto,
  ): Promise<GalleryItemResponseDto> {
    const myAccount = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    const gallery = await this.commandBus.execute<
      UpdateGalleryImageCommand,
      AccountGallery
    >(
      new UpdateGalleryImageCommand(
        myAccount.id,
        galleryId,
        dto.imageUrl,
        dto.caption,
      ),
    );

    return gallery.toObject() as unknown as GalleryItemResponseDto;
  }

  @Delete('me/gallery/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Remove gallery image',
    description: 'Delete an image from the account gallery',
  })
  async removeGalleryImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') galleryId: string,
  ): Promise<void> {
    const myAccount = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    await this.commandBus.execute(
      new RemoveGalleryImageCommand(myAccount.id, galleryId),
    );
  }

  @Put('me/gallery/reorder')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reorder gallery images',
    description: 'Update the sort order of gallery images',
  })
  async reorderGallery(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderGalleryDto,
  ): Promise<void> {
    const myAccount = await this.queryBus.execute<
      GetMyAccountQuery,
      GetMyAccountResult
    >(new GetMyAccountQuery(user.id));

    await this.commandBus.execute(
      new ReorderGalleryImagesCommand(myAccount.id, dto.items),
    );
  }

  @Get(':id/gallery')
  @Public()
  @ApiOperation({
    summary: 'Get account gallery',
    description: 'View gallery images for a public account',
  })
  async getAccountGallery(
    @Param('id') accountId: string,
  ): Promise<GalleryItemResponseDto[]> {
    const gallery = await this.queryBus.execute<
      GetAccountGalleryQuery,
      AccountGallery[]
    >(new GetAccountGalleryQuery(accountId));

    return gallery.map(
      (item) => item.toObject() as unknown as GalleryItemResponseDto,
    );
  }
}

@Controller('admin/accounts')
export class AdminAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.PARTNER.READ)
  @ApiOperation({
    summary: 'List all accounts',
    description: 'Get a paginated list of all accounts with optional filters',
  })
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ): Promise<ListAccountsResult> {
    // Validate status if provided
    let statusEnum: AccountStatusEnum | undefined;
    if (status) {
      const validStatuses = Object.values(AccountStatusEnum);
      if (validStatuses.includes(status as AccountStatusEnum)) {
        statusEnum = status as AccountStatusEnum;
      }
    }

    // Validate type if provided
    let typeEnum: AccountTypeEnum | undefined;
    if (type) {
      const validTypes = Object.values(AccountTypeEnum);
      if (validTypes.includes(type as AccountTypeEnum)) {
        typeEnum = type as AccountTypeEnum;
      }
    }

    return this.queryBus.execute(
      new ListAccountsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        statusEnum,
        typeEnum,
        search,
      ),
    );
  }

  @Get('pending')
  @RequirePermissions(PERMISSIONS.PARTNER.APPROVE)
  @ApiOperation({
    summary: 'List pending partner accounts',
    description: 'Get a paginated list of accounts pending approval',
  })
  async listPending(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ListPendingAccountsResult> {
    return this.queryBus.execute(
      new ListPendingAccountsQuery(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER.APPROVE)
  @ApiOperation({
    summary: 'Approve partner account',
    description: 'Approve a pending partner account',
  })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(new ApproveAccountCommand(id, user.id));
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.PARTNER.REJECT)
  @ApiOperation({
    summary: 'Reject partner account',
    description: 'Reject a pending partner account with a reason',
  })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { reason: string },
  ): Promise<void> {
    await this.commandBus.execute(
      new RejectAccountCommand(id, user.id, body.reason),
    );
  }
}
