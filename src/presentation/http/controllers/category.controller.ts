import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '../../../shared/decorators/public.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
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
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
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
  @Roles('super_admin', 'admin')
  async list(
    @Query() query: ListCategoriesQueryDto,
  ): Promise<CategoriesListResponseDto> {
    const parentId = query.rootOnly ? null : query.parentId;
    return await this.queryBus.execute(
      new ListCategoriesQuery(true, parentId, query.page, query.limit),
    );
  }

  @Get(':id')
  @Roles('super_admin', 'admin')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return await this.queryBus.execute(new GetCategoryQuery(id));
  }

  @Post()
  @Roles('super_admin', 'admin')
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const result = await this.commandBus.execute(
      new CreateCategoryCommand(
        dto.name,
        dto.slug,
        dto.description,
        dto.parentId,
        dto.iconUrl,
        dto.sortOrder,
      ),
    );
    return await this.queryBus.execute(new GetCategoryQuery(result.id));
  }

  @Put(':id')
  @Roles('super_admin', 'admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
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
  @Roles('super_admin', 'admin')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteCategoryCommand(id));
  }
}
