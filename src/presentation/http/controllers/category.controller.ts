import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../shared/decorators/public.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '../../../shared/constants/permissions';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  ListCategoriesQueryDto,
  CategoryResponseDto,
  CategoriesListResponseDto,
} from '../dto/category';
import {
  CreateCategoryCommand,
  UpdateCategoryCommand,
  DeleteCategoryCommand,
} from '../../../core/application/category/commands';
import {
  GetCategoryQuery,
  ListCategoriesQuery,
} from '../../../core/application/category/queries';

@Controller('categories')
export class CategoryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @Public()
  async list(
    @Query() query: ListCategoriesQueryDto,
  ): Promise<CategoriesListResponseDto> {
    const parentId = query.rootOnly ? null : query.parentId;
    return await this.queryBus.execute(
      new ListCategoriesQuery(
        query.includeInactive,
        parentId,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  @Public()
  async getById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.queryBus.execute(new GetCategoryQuery(id));
  }
}

@Controller('admin/categories')
export class AdminCategoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CATEGORY.LIST)
  async list(
    @Query() query: ListCategoriesQueryDto,
  ): Promise<CategoriesListResponseDto> {
    const parentId = query.rootOnly ? null : query.parentId;
    return await this.queryBus.execute(
      new ListCategoriesQuery(true, parentId, query.page, query.limit),
    );
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CATEGORY.READ)
  async getById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.queryBus.execute(new GetCategoryQuery(id));
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CATEGORY.CREATE)
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const result = await this.commandBus.execute<
      CreateCategoryCommand,
      { id: string }
    >(
      new CreateCategoryCommand(
        dto.name,
        dto.slug,
        dto.description,
        dto.parentId,
        dto.iconUrl,
        dto.sortOrder,
      ),
    );
    return await this.queryBus.execute<GetCategoryQuery, CategoryResponseDto>(
      new GetCategoryQuery(result.id),
    );
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.CATEGORY.UPDATE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    await this.commandBus.execute(
      new UpdateCategoryCommand(
        id,
        dto.name,
        dto.slug,
        dto.description,
        dto.iconUrl,
        dto.sortOrder,
      ),
    );
    return await this.queryBus.execute(new GetCategoryQuery(id));
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CATEGORY.DELETE)
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteCategoryCommand(id));
  }
}
