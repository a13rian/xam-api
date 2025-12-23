import { DataSource } from 'typeorm';
import { ServiceCategoryOrmEntity } from '../typeorm/entities/service-category.orm-entity';

const categoryData = [
  {
    name: 'Làm tóc',
    slug: 'lam-toc',
    description: 'Các dịch vụ cắt, nhuộm, uốn, duỗi tóc',
    iconUrl: 'https://cdn.example.com/icons/hair.svg',
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Dịch vụ trang điểm chuyên nghiệp',
    iconUrl: 'https://cdn.example.com/icons/makeup.svg',
  },
  {
    name: 'Nail',
    slug: 'nail',
    description: 'Chăm sóc và làm đẹp móng tay, móng chân',
    iconUrl: 'https://cdn.example.com/icons/nail.svg',
  },
  {
    name: 'Spa & Massage',
    slug: 'spa-massage',
    description: 'Dịch vụ spa, massage thư giãn và trị liệu',
    iconUrl: 'https://cdn.example.com/icons/spa.svg',
  },
  {
    name: 'Chăm sóc da',
    slug: 'cham-soc-da',
    description: 'Các liệu trình chăm sóc và điều trị da',
    iconUrl: 'https://cdn.example.com/icons/skincare.svg',
  },
  {
    name: 'Phun xăm thẩm mỹ',
    slug: 'phun-xam-tham-my',
    description: 'Phun xăm lông mày, môi, mí mắt',
    iconUrl: 'https://cdn.example.com/icons/tattoo.svg',
  },
  {
    name: 'Nối mi',
    slug: 'noi-mi',
    description: 'Dịch vụ nối mi, làm đẹp mi',
    iconUrl: 'https://cdn.example.com/icons/lash.svg',
  },
  {
    name: 'Barber',
    slug: 'barber',
    description: 'Dịch vụ cắt tóc và chăm sóc dành riêng cho nam giới',
    iconUrl: 'https://cdn.example.com/icons/barber.svg',
  },
];

export async function seedServiceCategories(
  dataSource: DataSource,
): Promise<ServiceCategoryOrmEntity[]> {
  const repository = dataSource.getRepository(ServiceCategoryOrmEntity);

  // Check if categories already exist
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log(`Service categories already seeded (${existingCount} found)`);
    return repository.find({ where: { isActive: true } });
  }

  console.log('Seeding service categories...');

  const categories: ServiceCategoryOrmEntity[] = [];

  for (let i = 0; i < categoryData.length; i++) {
    const data = categoryData[i];
    const category = new ServiceCategoryOrmEntity();
    category.name = data.name;
    category.slug = data.slug;
    category.description = data.description;
    category.iconUrl = data.iconUrl;
    category.sortOrder = i;
    category.isActive = true;
    categories.push(category);
  }

  const savedCategories = await repository.save(categories);
  console.log(`Seeded ${savedCategories.length} service categories`);

  return savedCategories;
}
