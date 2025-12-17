
import sharp from 'sharp';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

async function overwriteMaskable() {
  const input = join(root, 'public', 'renard-icon-maskable.svg');
  const output = join(root, 'dist', 'maskable-icon-512x512.png');
  const backgroundColor = '#FFFCFA'; // Match theme color

  try {
    console.log(`Overwriting maskable icon...`);
    console.log(`Input: ${input}`);
    
    await sharp(input)
      .resize(512, 512, { fit: 'contain', background: backgroundColor })
      .flatten({ background: backgroundColor })
      .toFile(output);
      
    console.log(`✅ Successfully created ${output}`);
  } catch (err) {
    console.error('❌ Failed to overwrite maskable icon:', err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  overwriteMaskable();
}

export { overwriteMaskable };
