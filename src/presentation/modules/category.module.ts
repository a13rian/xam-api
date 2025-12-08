import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CategoryController,
  AdminCategoryController,
} from '../http/controllers/category.controller';
import { ServiceCategoryOrmEntity } from '../../infrastructure/persistence/typeorm/entities/service-category.orm-entity';
import { ServiceCategoryRepository } from '../../infrastructure/persistence/typeorm/repositories/service-category.repository';
import { ServiceCategoryMapper } from '../../infrastructure/persistence/typeorm/mappers/service-category.mapper';
import { SERVICE_CATEGORY_REPOSITORY } from '../../core/domain/service/repositories/service-category.repository.interface';
import { CategoryCommandHandlers } from '../../core/application/category/commands';
import { CategoryQueryHandlers } from '../../core/application/category/queries';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ServiceCategoryOrmEntity])],
  controllers: [CategoryController, AdminCategoryController],
  providers: [
    ServiceCategoryMapper,
    {
      provide: SERVICE_CATEGORY_REPOSITORY,
      useClass: ServiceCategoryRepository,
    },
    ...CategoryCommandHandlers,
    ...CategoryQueryHandlers,
  ],
  exports: [SERVICE_CATEGORY_REPOSITORY],
})
export class CategoryModule {}
