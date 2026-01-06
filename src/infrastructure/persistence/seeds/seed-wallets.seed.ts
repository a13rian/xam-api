import { DataSource } from 'typeorm';
import { UserOrmEntity } from '../typeorm/entities/user.orm-entity';
import { WalletOrmEntity } from '../typeorm/entities/wallet.orm-entity';

const DEFAULT_CURRENCY = 'VND';
const BATCH_SIZE = 100;

export async function seedWallets(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(UserOrmEntity);
  const walletRepository = dataSource.getRepository(WalletOrmEntity);

  // Find all users who don't have a wallet yet
  const usersWithoutWallet = await userRepository
    .createQueryBuilder('user')
    .leftJoin(WalletOrmEntity, 'wallet', 'wallet.user_id = user.id')
    .where('wallet.id IS NULL')
    .getMany();

  if (usersWithoutWallet.length === 0) {
    console.log('All users already have wallets');
    return;
  }

  console.log(`Creating wallets for ${usersWithoutWallet.length} users...`);

  let seededCount = 0;
  for (let i = 0; i < usersWithoutWallet.length; i += BATCH_SIZE) {
    const batch = usersWithoutWallet.slice(i, i + BATCH_SIZE);

    const walletEntities = batch.map((user) => {
      const wallet = new WalletOrmEntity();
      wallet.userId = user.id;
      wallet.balance = 0;
      wallet.currency = DEFAULT_CURRENCY;
      return wallet;
    });

    await walletRepository.save(walletEntities);
    seededCount += walletEntities.length;
    console.log(
      `Seeded ${seededCount}/${usersWithoutWallet.length} wallets...`,
    );
  }

  console.log(`Seeded ${seededCount} wallets`);
}
