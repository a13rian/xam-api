import { DataSource } from 'typeorm';
import { WardOrmEntity } from '../typeorm/entities/ward.orm-entity';
import { DistrictOrmEntity } from '../typeorm/entities/district.orm-entity';
import * as fs from 'fs';
import * as path from 'path';

interface WardData {
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
  wards: WardData[];
}

const BATCH_SIZE = 500;

export async function seedWards(
  dataSource: DataSource,
  districts: DistrictOrmEntity[],
): Promise<WardOrmEntity[]> {
  const wardRepository = dataSource.getRepository(WardOrmEntity);
  const existingWards = await wardRepository.find();

  if (existingWards.length > 0) {
    console.log('Wards already seeded');
    return existingWards;
  }

  const dataFilePath = path.join(__dirname, 'data', 'vietnam-divisions.json');
  const rawData = fs.readFileSync(dataFilePath, 'utf-8');
  const data: VietnamDivisionsData = JSON.parse(rawData);

  // Create lookup map: district code -> district entity ID
  const districtCodeToId = new Map<string, string>();
  for (const district of districts) {
    districtCodeToId.set(district.code, district.id);
  }

  const wardEntities = data.wards.map((w, index) => {
    const entity = new WardOrmEntity();
    entity.code = w.code;
    entity.name = w.name;
    entity.slug = w.slug;
    entity.type = w.type;
    entity.districtId = districtCodeToId.get(w.parent_code) || '';
    entity.isActive = true;
    entity.order = index;
    entity.metadata = {
      nameWithType: w.name_with_type,
      path: w.path,
      pathWithType: w.path_with_type,
    };
    return entity;
  });

  // Filter out wards with invalid district references
  const validWards = wardEntities.filter((w) => w.districtId !== '');
  if (validWards.length !== wardEntities.length) {
    console.warn(
      `Warning: ${wardEntities.length - validWards.length} wards skipped due to missing district reference`,
    );
  }

  // Batch insert for better performance
  let seededCount = 0;
  for (let i = 0; i < validWards.length; i += BATCH_SIZE) {
    const batch = validWards.slice(i, i + BATCH_SIZE);
    await wardRepository.save(batch);
    seededCount += batch.length;
    console.log(`Seeded ${seededCount}/${validWards.length} wards...`);
  }

  console.log(`Seeded ${validWards.length} wards`);

  return wardRepository.find();
}
