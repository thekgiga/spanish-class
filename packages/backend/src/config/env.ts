import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.ENV || 'local';
const configPath = path.resolve(__dirname, '../../../config', env, '.env');

const result = dotenv.config({ path: configPath });

if (result.error) {
  console.error(`❌ Failed to load config from: ${configPath}`);
  console.error(`Error: ${result.error.message}`);
  process.exit(1);
}

console.log(`✓ Loaded environment config: ${env} (${configPath})`);

export { env };
