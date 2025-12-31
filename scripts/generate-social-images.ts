import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'public', 'social');
const logoPath = join(rootDir, 'logo-original.jpg');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Twitter/X image dimensions: 1200x675 (16:9)
const TWITTER_WIDTH = 1200;
const TWITTER_HEIGHT = 675;

// Create main announcement image
async function createLaunchImage() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#bg)"/>
      <circle cx="100" cy="337" r="400" fill="#9945FF" fill-opacity="0.1"/>
      <circle cx="1100" cy="337" r="400" fill="#14F195" fill-opacity="0.1"/>
      
      <!-- Main title -->
      <text x="600" y="200" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="72">FakeSOL</text>
      <text x="600" y="260" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="28">The Devnet-Only Solana Wallet</text>
      
      <!-- Feature boxes -->
      <rect x="100" y="320" width="220" height="80" rx="12" fill="#27272a"/>
      <text x="210" y="355" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="24">✓</text>
      <text x="210" y="385" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">Real Wallet</text>
      
      <rect x="340" y="320" width="220" height="80" rx="12" fill="#27272a"/>
      <text x="450" y="355" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="24">✓</text>
      <text x="450" y="385" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">Fake SOL</text>
      
      <rect x="580" y="320" width="220" height="80" rx="12" fill="#27272a"/>
      <text x="690" y="355" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="24">✓</text>
      <text x="690" y="385" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">Browser Extension</text>
      
      <rect x="820" y="320" width="220" height="80" rx="12" fill="#27272a"/>
      <text x="930" y="355" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="24">✓</text>
      <text x="930" y="385" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">No Risk</text>
      
      <!-- CTA -->
      <rect x="450" y="480" width="300" height="60" rx="30" fill="#9945FF"/>
      <text x="600" y="520" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="22">fakesol.com</text>
      
      <!-- Devnet badge -->
      <rect x="500" y="580" width="200" height="40" rx="20" fill="#eab308" fill-opacity="0.2"/>
      <text x="600" y="607" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-weight="bold" font-size="16">DEVNET ONLY</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'launch-announcement.png'));
  
  console.log('Created launch-announcement.png');
}

// Create "pain point" meme image
async function createPainPointImage() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#bg2)"/>
      
      <!-- Left side - Problem -->
      <rect x="50" y="100" width="500" height="475" rx="20" fill="#27272a" stroke="#ef4444" stroke-width="3"/>
      <text x="300" y="160" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-weight="bold" font-size="28">❌ Testing with Mainnet</text>
      <text x="300" y="220" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="20">"Oops, wrong network"</text>
      <text x="300" y="280" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-size="48">-2 SOL</text>
      <text x="300" y="340" text-anchor="middle" fill="#71717a" font-family="Arial, sans-serif" font-size="18">• Risk of losing real funds</text>
      <text x="300" y="380" text-anchor="middle" fill="#71717a" font-family="Arial, sans-serif" font-size="18">• Mixed with personal wallet</text>
      <text x="300" y="420" text-anchor="middle" fill="#71717a" font-family="Arial, sans-serif" font-size="18">• Network switching errors</text>
      <text x="300" y="520" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="64">🤡</text>
      
      <!-- Right side - Solution -->
      <rect x="650" y="100" width="500" height="475" rx="20" fill="#27272a" stroke="#14F195" stroke-width="3"/>
      <text x="900" y="160" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="28">✓ Testing with FakeSOL</text>
      <text x="900" y="220" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="20">"Can't touch mainnet"</text>
      <text x="900" y="280" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="48">0 RISK</text>
      <text x="900" y="340" text-anchor="middle" fill="#71717a" font-family="Arial, sans-serif" font-size="18">• Devnet only by design</text>
      <text x="900" y="380" text-anchor="middle" fill="#71717a" font-family="Arial, sans-serif" font-size="18">• Separate test wallets</text>
      <text x="900" y="420" text-anchor="middle" fill="#71717a" font-family="Arial, sans-serif" font-size="18">• Free devnet airdrops</text>
      <text x="900" y="520" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="64">🧠</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'pain-point-comparison.png'));
  
  console.log('Created pain-point-comparison.png');
}

// Create feature highlight - Extension
async function createExtensionImage() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#bg3)"/>
      <circle cx="900" cy="337" r="500" fill="#9945FF" fill-opacity="0.08"/>
      
      <!-- Chrome icon area -->
      <rect x="100" y="150" width="400" height="375" rx="20" fill="#27272a"/>
      <text x="300" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="120">🧩</text>
      <text x="300" y="380" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="28">Chrome Extension</text>
      <text x="300" y="420" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">Available Now</text>
      
      <!-- Features -->
      <text x="600" y="180" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="36">FakeSOL Extension</text>
      
      <text x="600" y="260" fill="#14F195" font-family="Arial, sans-serif" font-size="24">→</text>
      <text x="640" y="260" fill="white" font-family="Arial, sans-serif" font-size="22">Inject wallet into any dApp</text>
      
      <text x="600" y="320" fill="#14F195" font-family="Arial, sans-serif" font-size="24">→</text>
      <text x="640" y="320" fill="white" font-family="Arial, sans-serif" font-size="22">Import from fakesol.com</text>
      
      <text x="600" y="380" fill="#14F195" font-family="Arial, sans-serif" font-size="24">→</text>
      <text x="640" y="380" fill="white" font-family="Arial, sans-serif" font-size="22">Works like Phantom</text>
      
      <text x="600" y="440" fill="#14F195" font-family="Arial, sans-serif" font-size="24">→</text>
      <text x="640" y="440" fill="white" font-family="Arial, sans-serif" font-size="22">Devnet transactions only</text>
      
      <!-- CTA -->
      <rect x="600" y="500" width="350" height="55" rx="27" fill="#9945FF"/>
      <text x="775" y="536" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Get it on Chrome Web Store</text>
      
      <!-- Badge -->
      <rect x="600" y="580" width="140" height="35" rx="17" fill="#eab308" fill-opacity="0.2"/>
      <text x="670" y="604" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-weight="bold" font-size="14">DEVNET ONLY</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'extension-feature.png'));
  
  console.log('Created extension-feature.png');
}

// Create faucet feature image
async function createFaucetImage() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#bg4)"/>
      <circle cx="600" cy="337" r="400" fill="#14F195" fill-opacity="0.08"/>
      
      <!-- Main content -->
      <text x="600" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="48">Tired of Faucet Rate Limits?</text>
      
      <text x="600" y="250" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-size="28">😤 "Too many requests, try again later"</text>
      
      <!-- Arrow down -->
      <text x="600" y="320" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="36">↓</text>
      
      <!-- Solution box -->
      <rect x="300" y="360" width="600" height="200" rx="20" fill="#27272a" stroke="#14F195" stroke-width="2"/>
      <text x="600" y="410" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="32">FakeSOL Treasury Faucet</text>
      
      <text x="400" y="470" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20">💰 1 SOL</text>
      <text x="600" y="470" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20">⏱️ 30s cooldown</text>
      <text x="800" y="470" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20">🔓 No captcha</text>
      
      <text x="600" y="530" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">Get testing SOL instantly</text>
      
      <!-- CTA -->
      <text x="600" y="620" text-anchor="middle" fill="#9945FF" font-family="Arial, sans-serif" font-weight="bold" font-size="28">fakesol.com</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'faucet-feature.png'));
  
  console.log('Created faucet-feature.png');
}

// Create simple branding image
async function createBrandImage() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#18181b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#09090b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#bg5)"/>
      <circle cx="200" cy="337" r="400" fill="#9945FF" fill-opacity="0.1"/>
      <circle cx="1000" cy="337" r="400" fill="#14F195" fill-opacity="0.1"/>
      
      <!-- Logo placeholder circle -->
      <circle cx="600" cy="280" r="100" fill="#27272a" stroke="#9945FF" stroke-width="3"/>
      <text x="600" y="300" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="48">FS</text>
      
      <text x="600" y="440" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="64">FakeSOL</text>
      <text x="600" y="500" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="28">Devnet Wallet for Developers</text>
      
      <rect x="450" y="550" width="300" height="50" rx="25" fill="#eab308" fill-opacity="0.2"/>
      <text x="600" y="583" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-weight="bold" font-size="20">DEVNET ONLY</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'brand-image.png'));
  
  console.log('Created brand-image.png');
}

// Run all generators
async function main() {
  console.log('Generating social media images...\n');
  
  await createLaunchImage();
  await createPainPointImage();
  await createExtensionImage();
  await createFaucetImage();
  await createBrandImage();
  
  console.log(`\n✅ All images saved to: ${outputDir}`);
  console.log('\nImages created:');
  console.log('  - launch-announcement.png (main launch post)');
  console.log('  - pain-point-comparison.png (meme format)');
  console.log('  - extension-feature.png (Chrome extension)');
  console.log('  - faucet-feature.png (faucet feature)');
  console.log('  - brand-image.png (general branding)');
}

main().catch(console.error);
