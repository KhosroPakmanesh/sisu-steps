import { readFileSync } from 'node:fs';
import { validatePackContent } from './content-validation/shared/pack-content.validator.mjs';

if (process.argv[2] !== '--stdin') {
  throw new Error('Provide an assembled content pack through --stdin.');
}

const pack = JSON.parse(readFileSync(0, 'utf8'));
const result = await validatePackContent(pack);
if (result.errors.length > 0) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}
console.log(JSON.stringify(result.summary, null, 2));
