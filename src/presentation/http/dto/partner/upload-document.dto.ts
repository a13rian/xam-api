import { IsEnum, IsUrl } from 'class-validator';
import { DocumentTypeEnum } from '../../../../core/domain/partner/entities/partner-document.entity';

export class UploadDocumentDto {
  @IsEnum(DocumentTypeEnum)
  type: DocumentTypeEnum;

  @IsUrl()
  url: string;
}
