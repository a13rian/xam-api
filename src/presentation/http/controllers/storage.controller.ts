import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthenticatedUser } from '@shared/interfaces/authenticated-user.interface';
import {
  UploadFileCommand,
  UploadFileResult,
} from '@core/application/storage/commands';
import {
  GetPresignedUrlQuery,
  GetPresignedUrlResult,
} from '@core/application/storage/queries';
import {
  UploadFileDto,
  UploadPurpose,
  FileUploadResponseDto,
  PresignedUrlResponseDto,
} from '../dto/storage';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'purpose'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        purpose: {
          type: 'string',
          enum: Object.values(UploadPurpose),
          description: 'Purpose of the upload',
        },
        caption: {
          type: 'string',
          description: 'Optional caption for gallery images',
        },
      },
    },
  })
  async uploadFile(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    const result = await this.commandBus.execute<
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
        user.id,
        'user',
        dto.purpose,
      ),
    );

    return {
      url: result.url,
      key: result.key,
      bucket: result.bucket,
      size: result.size,
    };
  }

  @Get('presigned-url/:bucket/:key')
  @ApiOperation({ summary: 'Get a presigned URL for file access' })
  @ApiQuery({
    name: 'expiresIn',
    required: false,
    type: Number,
    description: 'URL expiration time in seconds (default: 3600)',
  })
  async getPresignedUrl(
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: number,
  ): Promise<PresignedUrlResponseDto> {
    const result = await this.queryBus.execute<
      GetPresignedUrlQuery,
      GetPresignedUrlResult
    >(new GetPresignedUrlQuery(bucket, key, 'get', expiresIn || 3600));

    return {
      url: result.url,
      expiresIn: result.expiresIn,
    };
  }
}
