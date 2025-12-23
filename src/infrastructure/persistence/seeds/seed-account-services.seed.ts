import { DataSource } from 'typeorm';
import { AccountOrmEntity } from '../typeorm/entities/account.orm-entity';
import { AccountServiceOrmEntity } from '../typeorm/entities/account-service.orm-entity';
import { ServiceCategoryOrmEntity } from '../typeorm/entities/service-category.orm-entity';
import { AccountTypeEnum } from '../../../core/domain/account/value-objects/account-type.vo';

// Service definitions by category slug
const servicesByCategory: Record<
  string,
  Array<{
    name: string;
    basePrice: number;
    duration: number;
    description: string;
  }>
> = {
  'lam-toc': [
    {
      name: 'Cắt tóc nam',
      basePrice: 80000,
      duration: 30,
      description: 'Cắt tóc theo yêu cầu, tạo kiểu hiện đại',
    },
    {
      name: 'Cắt tóc nữ',
      basePrice: 120000,
      duration: 45,
      description: 'Cắt tóc nữ, tư vấn kiểu phù hợp khuôn mặt',
    },
    {
      name: 'Nhuộm tóc',
      basePrice: 350000,
      duration: 90,
      description: 'Nhuộm tóc với thuốc chất lượng, bảo vệ tóc',
    },
    {
      name: 'Uốn tóc',
      basePrice: 400000,
      duration: 120,
      description: 'Uốn tóc với công nghệ mới, giữ nếp lâu',
    },
    {
      name: 'Duỗi tóc',
      basePrice: 450000,
      duration: 120,
      description: 'Duỗi tóc thẳng mượt, không hư tổn',
    },
    {
      name: 'Phục hồi tóc',
      basePrice: 300000,
      duration: 60,
      description: 'Liệu trình phục hồi tóc hư tổn',
    },
    {
      name: 'Gội đầu massage',
      basePrice: 50000,
      duration: 30,
      description: 'Gội đầu kết hợp massage thư giãn',
    },
    {
      name: 'Highlight tóc',
      basePrice: 500000,
      duration: 150,
      description: 'Nhuộm highlight, tạo điểm nhấn',
    },
  ],
  makeup: [
    {
      name: 'Makeup cơ bản',
      basePrice: 200000,
      duration: 45,
      description: 'Trang điểm nhẹ nhàng cho công việc hàng ngày',
    },
    {
      name: 'Makeup dự tiệc',
      basePrice: 350000,
      duration: 60,
      description: 'Trang điểm sang trọng cho sự kiện',
    },
    {
      name: 'Makeup cô dâu',
      basePrice: 1500000,
      duration: 120,
      description: 'Trang điểm cô dâu chuyên nghiệp, thử makeup',
    },
    {
      name: 'Makeup chụp ảnh',
      basePrice: 400000,
      duration: 60,
      description: 'Trang điểm phù hợp ánh sáng studio',
    },
    {
      name: 'Makeup đi làm',
      basePrice: 150000,
      duration: 30,
      description: 'Trang điểm nhanh, tự nhiên cho công sở',
    },
  ],
  nail: [
    {
      name: 'Sơn gel',
      basePrice: 150000,
      duration: 45,
      description: 'Sơn gel bền màu, nhiều lựa chọn',
    },
    {
      name: 'Nail art',
      basePrice: 250000,
      duration: 60,
      description: 'Thiết kế móng nghệ thuật theo yêu cầu',
    },
    {
      name: 'Chăm sóc móng',
      basePrice: 100000,
      duration: 30,
      description: 'Làm sạch, dưỡng móng và da tay',
    },
    {
      name: 'Đắp bột',
      basePrice: 300000,
      duration: 90,
      description: 'Đắp móng bột, tạo hình theo ý',
    },
    {
      name: 'Tháo móng gel/bột',
      basePrice: 80000,
      duration: 30,
      description: 'Tháo móng an toàn, không hư móng thật',
    },
    {
      name: 'Pedicure',
      basePrice: 200000,
      duration: 60,
      description: 'Chăm sóc và làm đẹp móng chân',
    },
  ],
  'spa-massage': [
    {
      name: 'Massage toàn thân',
      basePrice: 400000,
      duration: 90,
      description: 'Massage thư giãn toàn thân, giảm căng thẳng',
    },
    {
      name: 'Massage mặt',
      basePrice: 200000,
      duration: 45,
      description: 'Massage mặt, giúp lưu thông máu',
    },
    {
      name: 'Xông hơi',
      basePrice: 150000,
      duration: 30,
      description: 'Xông hơi detox, thải độc cơ thể',
    },
    {
      name: 'Tắm trắng',
      basePrice: 500000,
      duration: 60,
      description: 'Liệu trình tắm trắng an toàn',
    },
    {
      name: 'Massage đá nóng',
      basePrice: 500000,
      duration: 90,
      description: 'Massage với đá nóng, thư giãn sâu',
    },
    {
      name: 'Body scrub',
      basePrice: 300000,
      duration: 45,
      description: 'Tẩy da chết toàn thân, làm mềm da',
    },
  ],
  'cham-soc-da': [
    {
      name: 'Chăm sóc da cơ bản',
      basePrice: 250000,
      duration: 60,
      description: 'Làm sạch, dưỡng ẩm, bảo vệ da',
    },
    {
      name: 'Trị mụn',
      basePrice: 400000,
      duration: 75,
      description: 'Liệu trình điều trị mụn chuyên sâu',
    },
    {
      name: 'Trẻ hóa da',
      basePrice: 600000,
      duration: 90,
      description: 'Liệu trình chống lão hóa, săn chắc da',
    },
    {
      name: 'Peel da',
      basePrice: 350000,
      duration: 45,
      description: 'Peel da nhẹ, loại bỏ tế bào chết',
    },
    {
      name: 'Đắp mặt nạ',
      basePrice: 150000,
      duration: 30,
      description: 'Đắp mặt nạ dưỡng da cao cấp',
    },
    {
      name: 'Điện di vitamin',
      basePrice: 450000,
      duration: 60,
      description: 'Đưa vitamin vào da bằng điện di',
    },
  ],
  'phun-xam-tham-my': [
    {
      name: 'Phun môi',
      basePrice: 2000000,
      duration: 120,
      description: 'Phun môi collagen, màu tự nhiên',
    },
    {
      name: 'Phun chân mày',
      basePrice: 1800000,
      duration: 90,
      description: 'Điêu khắc chân mày, tạo form chuẩn',
    },
    {
      name: 'Phun mí mắt',
      basePrice: 1500000,
      duration: 60,
      description: 'Phun mí mắt tự nhiên, tôn đôi mắt',
    },
    {
      name: 'Xóa xăm',
      basePrice: 500000,
      duration: 30,
      description: 'Xóa xăm bằng công nghệ laser',
    },
  ],
  'noi-mi': [
    {
      name: 'Nối mi classic',
      basePrice: 300000,
      duration: 90,
      description: 'Nối mi classic 1:1, tự nhiên',
    },
    {
      name: 'Nối mi volume',
      basePrice: 450000,
      duration: 120,
      description: 'Nối mi volume dày, đẹp',
    },
    {
      name: 'Nối mi hybrid',
      basePrice: 400000,
      duration: 100,
      description: 'Kết hợp classic và volume',
    },
    {
      name: 'Gỡ mi',
      basePrice: 80000,
      duration: 30,
      description: 'Gỡ mi an toàn, không hại mi thật',
    },
    {
      name: 'Uốn mi',
      basePrice: 200000,
      duration: 45,
      description: 'Uốn cong mi tự nhiên, giữ lâu',
    },
  ],
  barber: [
    {
      name: 'Cắt tóc nam cao cấp',
      basePrice: 150000,
      duration: 45,
      description: 'Cắt tóc nam theo trend, tư vấn kiểu',
    },
    {
      name: 'Cạo râu',
      basePrice: 50000,
      duration: 20,
      description: 'Cạo râu với dao lam truyền thống',
    },
    {
      name: 'Combo cắt + cạo',
      basePrice: 180000,
      duration: 60,
      description: 'Trọn gói cắt tóc và cạo râu',
    },
    {
      name: 'Tạo kiểu tóc',
      basePrice: 80000,
      duration: 20,
      description: 'Tạo kiểu với wax, gel chuyên nghiệp',
    },
    {
      name: 'Nhuộm tóc nam',
      basePrice: 250000,
      duration: 60,
      description: 'Nhuộm tóc màu thời thượng cho nam',
    },
    {
      name: 'Gội massage',
      basePrice: 80000,
      duration: 30,
      description: 'Gội đầu kết hợp massage đầu, vai, cổ',
    },
  ],
};

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function seedAccountServices(
  dataSource: DataSource,
  accounts: AccountOrmEntity[],
  categories: ServiceCategoryOrmEntity[],
): Promise<AccountServiceOrmEntity[]> {
  const repository = dataSource.getRepository(AccountServiceOrmEntity);

  // Check if account services already exist
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log(`Account services already seeded (${existingCount} found)`);
    return repository.find();
  }

  console.log('Seeding account services...');

  // Create category map by slug
  const categoryMap = new Map<string, ServiceCategoryOrmEntity>();
  for (const cat of categories) {
    categoryMap.set(cat.slug, cat);
  }

  const allAccountServices: AccountServiceOrmEntity[] = [];
  const categorySlugs = Object.keys(servicesByCategory);

  for (const account of accounts) {
    // Determine if business or individual
    const isBusiness = account.type === AccountTypeEnum.BUSINESS;

    // Each account gets 3-7 services
    const numServices = getRandomInt(3, 7);

    // Pick random categories (2-4 categories per account)
    const numCategories = getRandomInt(2, 4);
    const selectedCategorySlugs = shuffleArray(categorySlugs).slice(
      0,
      Math.min(numCategories, categorySlugs.length),
    );

    // Track service names to avoid duplicates for this account
    const usedServiceNames = new Set<string>();
    let serviceCount = 0;

    for (const categorySlug of selectedCategorySlugs) {
      if (serviceCount >= numServices) break;

      const category = categoryMap.get(categorySlug);
      if (!category) continue;

      const servicesForCategory = servicesByCategory[categorySlug];
      if (!servicesForCategory) continue;

      // Pick 1-3 services from this category
      const numFromCategory = getRandomInt(1, 3);
      const shuffledServices = shuffleArray(servicesForCategory);

      for (let i = 0; i < numFromCategory && serviceCount < numServices; i++) {
        const serviceData = shuffledServices[i];
        if (!serviceData) continue;

        // Skip if service name already used for this account
        if (usedServiceNames.has(serviceData.name)) continue;
        usedServiceNames.add(serviceData.name);

        const accountService = new AccountServiceOrmEntity();
        accountService.accountId = account.id;
        accountService.categoryId = category.id;
        accountService.name = serviceData.name;
        accountService.description = serviceData.description;

        // Price multiplier based on account type
        // Business: 1.5x - 2.5x base price
        // Individual: 1.0x - 1.5x base price
        const minMultiplier = isBusiness ? 1.5 : 1.0;
        const maxMultiplier = isBusiness ? 2.5 : 1.5;
        const priceMultiplier =
          minMultiplier + Math.random() * (maxMultiplier - minMultiplier);

        // Round to nearest 10000 VND
        accountService.priceAmount =
          Math.round((serviceData.basePrice * priceMultiplier) / 10000) * 10000;
        accountService.priceCurrency = 'VND';

        // Duration with some variation (±15 minutes)
        accountService.durationMinutes =
          serviceData.duration + getRandomInt(-15, 15);
        if (accountService.durationMinutes < 15) {
          accountService.durationMinutes = 15;
        }

        // 90% active, 10% inactive
        accountService.isActive = Math.random() < 0.9;

        accountService.sortOrder = serviceCount;

        allAccountServices.push(accountService);
        serviceCount++;
      }
    }
  }

  // Batch save
  const BATCH_SIZE = 100;
  let seededCount = 0;

  for (let i = 0; i < allAccountServices.length; i += BATCH_SIZE) {
    const batch = allAccountServices.slice(i, i + BATCH_SIZE);
    await repository.save(batch);
    seededCount += batch.length;
    console.log(
      `Seeded ${seededCount}/${allAccountServices.length} account services...`,
    );
  }

  console.log(`Seeded ${allAccountServices.length} account services`);

  return allAccountServices;
}
