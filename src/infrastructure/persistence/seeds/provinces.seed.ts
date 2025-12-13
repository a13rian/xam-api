import { DataSource } from 'typeorm';
import { ProvinceOrmEntity } from '../typeorm/entities/province.orm-entity';
import * as fs from 'fs';
import * as path from 'path';

interface ProvinceData {
  name: string;
  slug: string;
  type: string;
  name_with_type: string;
  code: string;
}

interface VietnamDivisionsData {
  provinces: ProvinceData[];
}

export async function seedProvinces(
  dataSource: DataSource,
): Promise<ProvinceOrmEntity[]> {
  const provinceRepository = dataSource.getRepository(ProvinceOrmEntity);
  const existingProvinces = await provinceRepository.find();

  if (existingProvinces.length > 0) {
    console.log('Provinces already seeded');
    return existingProvinces;
  }

  const dataFilePath = path.join(__dirname, 'data', 'vietnam-divisions.json');
  const rawData = fs.readFileSync(dataFilePath, 'utf-8');
  const data: VietnamDivisionsData = JSON.parse(rawData);

  const provinceEntities = data.provinces.map((p, index) => {
    const entity = new ProvinceOrmEntity();
    entity.code = p.code;
    entity.name = p.name;
    entity.slug = p.slug;
    entity.type = p.type;
    entity.isActive = true;
    entity.order = index;
    entity.metadata = {
      nameWithType: p.name_with_type,
    };
    return entity;
  });

  await provinceRepository.save(provinceEntities);
  console.log(`Seeded ${provinceEntities.length} provinces`);

  return provinceRepository.find();
}
