export class DocumentResponseDto {
  id: string;
  partnerId: string;
  type: string;
  url: string;
  status: string;
  rejectionReason?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
}
