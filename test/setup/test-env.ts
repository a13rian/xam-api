import { config } from 'dotenv';

// Preload pg driver for TypeORM
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('pg');

// Load test environment variables
config({ path: '.env.test' });

// Override any remaining defaults
process.env.NODE_ENV = 'test';
process.env.DB_DATABASE = 'xam_api_test';
process.env.DB_PORT = '5433';

// Increase timeout for async operations
jest.setTimeout(30000);
