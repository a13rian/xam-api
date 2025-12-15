import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserAvatarCommand } from './update-avatar.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@core/domain/user/repositories/user.repository.interface';
import {
  UploadFileCommand,
  UploadFileResult,
  DeleteFileCommand,
} from '@core/application/storage/commands';
import { StorageConfigService } from '@infrastructure/config/storage.config';

export interface UpdateAvatarResult {
  avatarUrl: string;
}

@CommandHandler(UpdateUserAvatarCommand)
export class UpdateUserAvatarHandler implements ICommandHandler<UpdateUserAvatarCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly commandBus: CommandBus,
    private readonly storageConfig: StorageConfigService,
  ) {}

  async execute(command: UpdateUserAvatarCommand): Promise<UpdateAvatarResult> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete old avatar if exists (extract key from URL)
    const oldAvatarUrl = user.avatarUrl;
    if (oldAvatarUrl) {
      const oldKey = this.extractKeyFromUrl(oldAvatarUrl);
      if (oldKey) {
        await this.commandBus.execute(
          new DeleteFileCommand(this.storageConfig.buckets.avatars, oldKey),
        );
      }
    }

    // Upload new avatar
    const uploadResult = await this.commandBus.execute<
      UploadFileCommand,
      UploadFileResult
    >(
      new UploadFileCommand(
        {
          buffer: command.file.buffer,
          originalname: command.file.originalname,
          mimetype: command.file.mimetype,
          size: command.file.size,
        },
        command.userId,
        'user',
        'avatar',
      ),
    );

    // Update user avatar
    user.updateAvatar(uploadResult.url);
    await this.userRepository.save(user);

    return { avatarUrl: uploadResult.url };
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Remove leading slash and bucket name
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1) {
        // Skip bucket name, join rest as key
        return pathParts.slice(1).join('/');
      }
      return null;
    } catch {
      return null;
    }
  }
}
