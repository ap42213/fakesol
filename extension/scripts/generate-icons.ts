import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sizes = [16, 48, 128];

// Create a simple gradient icon with "F" letter
async function generateIcon(size: number, outputPath: string) {
  // Purple to green gradient SVG with F letter
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
            fill="white" font-family="Arial, sans-serif" font-weight="bold" 
            font-size="${size * 0.6}">F</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);

  console.log(`Generated ${outputPath}`);
}

async function main() {
  // Ensure icons directories exist
  const iconsDirs = [
    join(rootDir, 'icons'),
    join(rootDir, 'dist', 'icons'),
  ];

  for (const dir of iconsDirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  // Generate icons for each size
  for (const size of sizes) {
    await generateIcon(size, join(rootDir, 'icons', `icon${size}.png`));
    await generateIcon(size, join(rootDir, 'dist', 'icons', `icon${size}.png`));
  }

  console.log('Icons generated successfully!');
}

main().catch(console.error);
