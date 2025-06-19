import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const prNumber = process.env.PR_NUMBER;
if (!prNumber) {
  console.error('PR_NUMBER environment variable is required');
  process.exit(1);
}

const dir = join('.', `pr-${prNumber}`);
if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log(`Deleted ${dir}`);
} else {
  console.log(`Directory ${dir} does not exist`);
}
