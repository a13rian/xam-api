import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RemoveUserAvatarCommand } from './remove-avatar.command';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '@core/domain/user/repositories/user.repository.interface';
import { DeleteFileCommand } from '@core/application/storage/commands';
import { StorageConfigService } from '@infrastructure/config/storage.config';

@CommandHandler(RemoveUserAvatarCommand)
export class RemoveUserAvatarHandler implements ICommandHandler<RemoveUserAvatarCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly commandBus: CommandBus,
    private readonly storageConfig: StorageConfigService,
  ) {}

  async execute(command: RemoveUserAvatarCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete avatar file if exists
    const avatarUrl = user.avatarUrl;
    if (avatarUrl) {
      const key = this.extractKeyFromUrl(avatarUrl);
      if (key) {
        await this.commandBus.execute(
          new DeleteFileCommand(this.storageConfig.buckets.avatars, key),
        );
      }
    }

    // Clear avatar URL
    user.updateAvatar(null);
    await this.userRepository.save(user);
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
