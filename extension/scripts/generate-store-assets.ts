import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const storeDir = join(rootDir, 'store-assets');
const logoPath = join(rootDir, '..', 'logo-original.jpg');

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
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
    </svg>
  `;

  // Create background
  const background = await sharp(Buffer.from(svg)).png().toBuffer();
  
  // Resize logo
  const logo = await sharp(logoPath).resize(120, 120).png().toBuffer();
  
  // Composite
  await sharp(background)
    .composite([
      { input: logo, left: 160, top: 30 }
    ])
    .png()
    .toBuffer()
    .then(async (buf) => {
      // Add text overlay
      const textSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="220" y="185" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="32">FakeSOL</text>
          <text x="220" y="215" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="14">Devnet Wallet for Developers</text>
          <rect x="160" y="235" width="120" height="26" rx="13" fill="#eab308" fill-opacity="0.2"/>
          <text x="220" y="253" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-size="12" font-weight="bold">DEVNET ONLY</text>
        </svg>
      `;
      await sharp(buf)
        .composite([{ input: Buffer.from(textSvg), left: 0, top: 0 }])
        .toFile(join(storeDir, 'promo-tile-440x280.png'));
    });
  
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
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg2)"/>
      <circle cx="200" cy="280" r="300" fill="#9945FF" fill-opacity="0.08"/>
      <circle cx="1200" cy="280" r="300" fill="#14F195" fill-opacity="0.08"/>
    </svg>
  `;

  const background = await sharp(Buffer.from(svg)).png().toBuffer();
  const logo = await sharp(logoPath).resize(200, 200).png().toBuffer();
  
  await sharp(background)
    .composite([{ input: logo, left: 600, top: 80 }])
    .png()
    .toBuffer()
    .then(async (buf) => {
      const textSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="700" y="340" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="56">FakeSOL Wallet</text>
          <text x="700" y="390" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="24">The Devnet-Only Solana Wallet for Developers</text>
          <text x="400" y="480" text-anchor="middle" fill="#9945FF" font-family="Arial, sans-serif" font-size="18">Connect to dApps</text>
          <text x="700" y="480" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="18">Sign Transactions</text>
          <text x="1000" y="480" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-size="18">Safe Testing</text>
        </svg>
      `;
      await sharp(buf)
        .composite([{ input: Buffer.from(textSvg), left: 0, top: 0 }])
        .toFile(join(storeDir, 'marquee-1400x560.png'));
    });
  
  console.log('Created marquee-1400x560.png');
}

// Create screenshot (1280x800)
async function createScreenshot() {
  const width = 1280;
  const height = 800;
  
  // Dark browser-like mockup with extension popup
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="popupBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#18181b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#09090b;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Browser background -->
      <rect width="${width}" height="${height}" fill="#1a1a1a"/>
      
      <!-- Browser toolbar -->
      <rect width="${width}" height="60" fill="#2d2d2d"/>
      <circle cx="25" cy="30" r="7" fill="#ff5f57"/>
      <circle cx="50" cy="30" r="7" fill="#febc2e"/>
      <circle cx="75" cy="30" r="7" fill="#28c840"/>
      
      <!-- URL bar -->
      <rect x="120" y="15" width="500" height="30" rx="6" fill="#404040"/>
      <text x="140" y="36" fill="#888" font-family="Arial, sans-serif" font-size="13">app.example-dapp.com</text>
      
      <!-- Extension icon in toolbar -->
      <rect x="1180" y="15" width="30" height="30" rx="6" fill="#3d3d3d"/>
      
      <!-- Main content area -->
      <rect y="60" width="${width}" height="${height - 60}" fill="#0a0a0a"/>
      
      <!-- dApp content simulation -->
      <text x="100" y="150" fill="#fff" font-family="Arial, sans-serif" font-size="28" font-weight="bold">Connect Your Wallet</text>
      <text x="100" y="185" fill="#888" font-family="Arial, sans-serif" font-size="16">Select a wallet to connect to this dApp</text>
      
      <!-- Wallet options -->
      <rect x="100" y="220" width="400" height="60" rx="12" fill="#1f1f1f" stroke="#333" stroke-width="1"/>
      <text x="180" y="258" fill="#fff" font-family="Arial, sans-serif" font-size="16">Phantom</text>
      
      <rect x="100" y="295" width="400" height="60" rx="12" fill="#1f1f1f" stroke="#333" stroke-width="1"/>
      <text x="180" y="333" fill="#fff" font-family="Arial, sans-serif" font-size="16">Backpack</text>
      
      <rect x="100" y="370" width="400" height="60" rx="12" fill="#262626" stroke="#9945FF" stroke-width="2"/>
      <text x="180" y="408" fill="#fff" font-family="Arial, sans-serif" font-size="16" font-weight="bold">FakeSOL</text>
      <text x="290" y="408" fill="#eab308" font-family="Arial, sans-serif" font-size="11">DEVNET</text>
      
      <!-- Extension popup -->
      <rect x="750" y="80" width="380" height="500" rx="16" fill="url(#popupBg)" stroke="#333" stroke-width="1"/>
      
      <!-- Popup header -->
      <text x="940" y="130" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="24">FakeSOL</text>
      <rect x="870" y="145" width="140" height="24" rx="12" fill="#eab308" fill-opacity="0.2"/>
      <text x="940" y="162" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-size="11" font-weight="bold">DEVNET ONLY</text>
      
      <!-- Connected status -->
      <circle cx="810" cy="210" r="6" fill="#22c55e"/>
      <text x="825" y="215" fill="#22c55e" font-family="Arial, sans-serif" font-size="14">Connected</text>
      
      <!-- Wallet address -->
      <rect x="780" y="240" width="320" height="50" rx="8" fill="#27272a"/>
      <text x="940" y="272" text-anchor="middle" fill="#a1a1aa" font-family="monospace" font-size="13">7xKX...3mPq</text>
      
      <!-- Balance -->
      <text x="940" y="330" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="36">5.00 SOL</text>
      <text x="940" y="355" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="14">Devnet Balance</text>
      
      <!-- Action buttons -->
      <rect x="790" y="390" width="145" height="44" rx="8" fill="#9945FF"/>
      <text x="862" y="418" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Airdrop</text>
      
      <rect x="945" y="390" width="145" height="44" rx="8" fill="#27272a"/>
      <text x="1018" y="418" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Copy</text>
      
      <!-- Network indicator -->
      <rect x="850" y="480" width="180" height="36" rx="18" fill="#14F195" fill-opacity="0.15"/>
      <circle cx="880" cy="498" r="5" fill="#14F195"/>
      <text x="895" y="503" fill="#14F195" font-family="Arial, sans-serif" font-size="13">Solana Devnet</text>
    </svg>
  `;

  const background = await sharp(Buffer.from(svg)).png().toBuffer();
  const logoSmall = await sharp(logoPath).resize(40, 40).png().toBuffer();
  const logoPopup = await sharp(logoPath).resize(50, 50).png().toBuffer();
  
  await sharp(background)
    .composite([
      { input: logoSmall, left: 120, top: 380 },
      { input: logoPopup, left: 1180, top: 15 },
    ])
    .toFile(join(storeDir, 'screenshot-1280x800.png'));
  
  console.log('Created screenshot-1280x800.png');
}

// Create second screenshot showing import flow
async function createScreenshot2() {
  const width = 1280;
  const height = 800;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="popupBg2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#18181b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#09090b;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Dark background -->
      <rect width="${width}" height="${height}" fill="#0a0a0a"/>
      
      <!-- Extension popup centered -->
      <rect x="450" y="100" width="380" height="600" rx="16" fill="url(#popupBg2)" stroke="#333" stroke-width="1"/>
      
      <!-- Popup header -->
      <text x="640" y="205" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="28">Import Wallet</text>
      <text x="640" y="235" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="14">Enter your private key from fakesol.com</text>
      
      <!-- Private key input -->
      <text x="480" y="290" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="13">Private Key</text>
      <rect x="480" y="300" width="320" height="100" rx="8" fill="#27272a" stroke="#3f3f46" stroke-width="1"/>
      <text x="500" y="340" fill="#71717a" font-family="monospace" font-size="12">4wBqpZM9xwH...</text>
      <text x="500" y="360" fill="#71717a" font-family="monospace" font-size="12">kL8mNpQrS2v...</text>
      <text x="500" y="380" fill="#71717a" font-family="monospace" font-size="12">xYz7AbCdEfG...</text>
      
      <!-- Instructions -->
      <text x="640" y="450" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="13">1. Go to fakesol.com</text>
      <text x="640" y="475" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="13">2. Create or view your wallet</text>
      <text x="640" y="500" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="13">3. Copy your private key</text>
      <text x="640" y="525" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="13">4. Paste it here</text>
      
      <!-- Import button -->
      <rect x="480" y="570" width="320" height="50" rx="8" fill="#9945FF"/>
      <text x="640" y="602" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">Import Wallet</text>
      
      <!-- Security note -->
      <rect x="480" y="640" width="320" height="40" rx="8" fill="#eab308" fill-opacity="0.1"/>
      <text x="640" y="665" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-size="11">Devnet only - Never use with real funds</text>
      
      <!-- Side callouts -->
      <text x="100" y="350" fill="#9945FF" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Easy Import</text>
      <text x="100" y="380" fill="#71717a" font-family="Arial, sans-serif" font-size="14">Just paste your</text>
      <text x="100" y="400" fill="#71717a" font-family="Arial, sans-serif" font-size="14">private key</text>
      
      <text x="900" y="350" fill="#14F195" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Safe Testing</text>
      <text x="900" y="380" fill="#71717a" font-family="Arial, sans-serif" font-size="14">Works only on</text>
      <text x="900" y="400" fill="#71717a" font-family="Arial, sans-serif" font-size="14">Solana Devnet</text>
    </svg>
  `;

  const background = await sharp(Buffer.from(svg)).png().toBuffer();
  const logo = await sharp(logoPath).resize(60, 60).png().toBuffer();
  
  await sharp(background)
    .composite([
      { input: logo, left: 610, top: 110 }
    ])
    .toFile(join(storeDir, 'screenshot-import-1280x800.png'));
  
  console.log('Created screenshot-import-1280x800.png');
}

async function main() {
  await createPromoTile();
  await createMarqueeTile();
  await createScreenshot();
  await createScreenshot2();
  console.log('\n✅ Store assets created in extension/store-assets/');
}

main().catch(console.error);
