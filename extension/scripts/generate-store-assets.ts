import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const storeDir = join(rootDir, 'store-assets');

// Ensure store assets directory exists
if (!existsSync(storeDir)) {
  mkdirSync(storeDir, { recursive: true });
}

// Create promotional tile (440x280)
async function createPromoTile() {
  const width = 440;
  const height = 280;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Icon -->
      <rect x="170" y="60" width="100" height="100" rx="20" fill="url(#accent)"/>
      <text x="220" y="130" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="50">F</text>
      
      <!-- Title -->
      <text x="220" y="200" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="28">FakeSOL</text>
      <text x="220" y="230" text-anchor="middle" fill="#a1a1aa" font-family="Arial" font-size="14">Devnet Wallet for Developers</text>
      
      <!-- Badge -->
      <rect x="175" y="245" width="90" height="24" rx="12" fill="#eab308" fill-opacity="0.2"/>
      <text x="220" y="262" text-anchor="middle" fill="#eab308" font-family="Arial" font-size="11" font-weight="bold">DEVNET ONLY</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(storeDir, 'promo-tile-440x280.png'));
  
  console.log('Created promo-tile-440x280.png');
}

// Create marquee tile (1400x560)
async function createMarqueeTile() {
  const width = 1400;
  const height = 560;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#18181b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#09090b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg2)"/>
      
      <!-- Decorative circles -->
      <circle cx="200" cy="280" r="300" fill="#9945FF" fill-opacity="0.1"/>
      <circle cx="1200" cy="280" r="300" fill="#14F195" fill-opacity="0.1"/>
      
      <!-- Icon -->
      <rect x="600" y="120" width="200" height="200" rx="40" fill="url(#accent2)"/>
      <text x="700" y="260" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="100">F</text>
      
      <!-- Title -->
      <text x="700" y="400" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="56">FakeSOL Wallet</text>
      <text x="700" y="450" text-anchor="middle" fill="#a1a1aa" font-family="Arial" font-size="24">The Devnet-Only Solana Wallet for Developers</text>
      
      <!-- Features -->
      <text x="400" y="510" text-anchor="middle" fill="#9945FF" font-family="Arial" font-size="16">🔌 Connect to dApps</text>
      <text x="700" y="510" text-anchor="middle" fill="#14F195" font-family="Arial" font-size="16">✍️ Sign Transactions</text>
      <text x="1000" y="510" text-anchor="middle" fill="#eab308" font-family="Arial" font-size="16">🛡️ Devnet Only</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(storeDir, 'marquee-1400x560.png'));
  
  console.log('Created marquee-1400x560.png');
}

// Create screenshot mockup (1280x800)
async function createScreenshot() {
  const width = 1280;
  const height = 800;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg3)"/>
      
      <!-- Browser chrome mockup -->
      <rect x="100" y="50" width="1080" height="700" rx="12" fill="#27272a" stroke="#3f3f46" stroke-width="1"/>
      <circle cx="130" cy="75" r="6" fill="#ef4444"/>
      <circle cx="155" cy="75" r="6" fill="#eab308"/>
      <circle cx="180" cy="75" r="6" fill="#22c55e"/>
      <rect x="200" y="65" width="400" height="20" rx="4" fill="#18181b"/>
      
      <!-- Extension popup mockup -->
      <rect x="780" y="90" width="360" height="600" rx="8" fill="#09090b" stroke="#3f3f46" stroke-width="1"/>
      
      <!-- Popup header -->
      <rect x="780" y="90" width="360" height="50" rx="8" fill="#18181b"/>
      <rect x="800" y="105" width="28" height="28" rx="6" fill="url(#accent3)"/>
      <text x="810" y="125" fill="white" font-family="Arial" font-weight="bold" font-size="12">F</text>
      <text x="840" y="125" fill="white" font-family="Arial" font-weight="bold" font-size="14">FakeSOL</text>
      <rect x="920" y="110" width="50" height="18" rx="9" fill="#eab308" fill-opacity="0.2"/>
      <text x="945" y="123" text-anchor="middle" fill="#eab308" font-family="Arial" font-size="9" font-weight="bold">Devnet</text>
      
      <!-- Balance -->
      <text x="960" y="200" text-anchor="middle" fill="#71717a" font-family="Arial" font-size="12">Total Balance</text>
      <text x="960" y="250" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="36">2.5000</text>
      <text x="1020" y="250" fill="#71717a" font-family="Arial" font-size="16">SOL</text>
      
      <!-- Address -->
      <rect x="800" y="290" width="320" height="60" rx="8" fill="#27272a"/>
      <text x="820" y="315" fill="#71717a" font-family="Arial" font-size="10">Wallet Address</text>
      <text x="820" y="335" fill="#9945FF" font-family="monospace" font-size="12">Fake...Ab12</text>
      
      <!-- Buttons -->
      <rect x="800" y="370" width="155" height="40" rx="8" fill="url(#accent3)"/>
      <text x="877" y="395" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="14">Receive</text>
      <rect x="965" y="370" width="155" height="40" rx="8" fill="#27272a" stroke="#3f3f46" stroke-width="1"/>
      <text x="1042" y="395" text-anchor="middle" fill="white" font-family="Arial" font-weight="bold" font-size="14">Send</text>
      
      <!-- Left side content -->
      <text x="150" y="150" fill="white" font-family="Arial" font-weight="bold" font-size="24">Connect your wallet to continue</text>
      <text x="150" y="180" fill="#71717a" font-family="Arial" font-size="14">Select a wallet to connect to this dApp</text>
      
      <rect x="150" y="220" width="580" height="60" rx="8" fill="#27272a" stroke="#9945FF" stroke-width="2"/>
      <rect x="170" y="235" width="30" height="30" rx="6" fill="url(#accent3)"/>
      <text x="180" y="256" fill="white" font-family="Arial" font-weight="bold" font-size="14">F</text>
      <text x="215" y="260" fill="white" font-family="Arial" font-weight="bold" font-size="16">FakeSOL Wallet</text>
      <text x="680" y="260" fill="#14F195" font-family="Arial" font-size="12">Connected ✓</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(storeDir, 'screenshot-1280x800.png'));
  
  console.log('Created screenshot-1280x800.png');
}

async function main() {
  await createPromoTile();
  await createMarqueeTile();
  await createScreenshot();
  console.log('\n✅ Store assets created in extension/store-assets/');
}

main().catch(console.error);
