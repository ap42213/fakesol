import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sizes = [16, 48, 128];

// Use the uploaded Leonardo AI logo
async function generateIcon(size: number, outputPath: string) {
  const logoPath = join(rootDir, '..', 'logo-original.jpg');
  
  await sharp(logoPath)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated ${outputPath}`);
}

async function main() {
  const iconDirs = [
    join(rootDir, 'icons'),
    join(rootDir, 'dist', 'icons'),
  ];
  
  for (const dir of iconDirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    for (const size of sizes) {
      const outputPath = join(dir, `icon${size}.png`);
      await generateIcon(size, outputPath);
    }
  }
  
  console.log('Icons generated successfully!');
}

main().catch(console.error);
