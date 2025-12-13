import { DataSource } from 'typeorm';
import { DistrictOrmEntity } from '../typeorm/entities/district.orm-entity';
import { ProvinceOrmEntity } from '../typeorm/entities/province.orm-entity';
import * as fs from 'fs';
import * as path from 'path';

interface DistrictData {
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  code: string;
  parent_code: string;
}

interface VietnamDivisionsData {
  districts: DistrictData[];
}

export async function seedDistricts(
  dataSource: DataSource,
  provinces: ProvinceOrmEntity[],
): Promise<DistrictOrmEntity[]> {
  const districtRepository = dataSource.getRepository(DistrictOrmEntity);
  const existingDistricts = await districtRepository.find();

  if (existingDistricts.length > 0) {
    console.log('Districts already seeded');
    return existingDistricts;
  }

  const dataFilePath = path.join(__dirname, 'data', 'vietnam-divisions.json');
  const rawData = fs.readFileSync(dataFilePath, 'utf-8');
  const data: VietnamDivisionsData = JSON.parse(rawData);

  // Create lookup map: province code -> province entity ID
  const provinceCodeToId = new Map<string, string>();
  for (const province of provinces) {
    provinceCodeToId.set(province.code, province.id);
  }

  const districtEntities = data.districts.map((d, index) => {
    const entity = new DistrictOrmEntity();
    entity.code = d.code;
    entity.name = d.name;
    entity.slug = d.slug;
    entity.type = d.type;
    entity.provinceId = provinceCodeToId.get(d.parent_code) || '';
    entity.isActive = true;
    entity.order = index;
    entity.metadata = {
      nameWithType: d.name_with_type,
      path: d.path,
      pathWithType: d.path_with_type,
    };
    return entity;
  });

  // Filter out districts with invalid province references
  const validDistricts = districtEntities.filter((d) => d.provinceId !== '');
  if (validDistricts.length !== districtEntities.length) {
    console.warn(
      `Warning: ${districtEntities.length - validDistricts.length} districts skipped due to missing province reference`,
    );
  }

  await districtRepository.save(validDistricts);
  console.log(`Seeded ${validDistricts.length} districts`);

  return districtRepository.find();
}
