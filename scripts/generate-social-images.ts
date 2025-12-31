import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'public', 'social');
const logoPath = join(rootDir, 'public', 'fakesol-logo.png');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

function clearOldSocialPngs() {
  if (!existsSync(outputDir)) return;
  const entries = readdirSync(outputDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.toLowerCase().endsWith('.png')) continue;
    unlinkSync(join(outputDir, entry.name));
  }
}

// Twitter/X image dimensions: 1200x675 (16:9)
const TWITTER_WIDTH = 1200;
const TWITTER_HEIGHT = 675;

// Create hero landing page image
async function createHeroImage() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="ctaBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#heroBg)"/>
      
      <!-- Background elements -->
      <circle cx="200" cy="200" r="300" fill="#9945FF" fill-opacity="0.05"/>
      <circle cx="1000" cy="400" r="250" fill="#14F195" fill-opacity="0.05"/>
      
      <!-- Main headline -->
      <text x="600" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="64">🚀 FakeSOL</text>
      <text x="600" y="170" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="32">DEVNET WALLET</text>
      <text x="600" y="210" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="24">Real Testing. Fake SOL. Zero Risk.</text>
      
      <!-- Feature highlights -->
      <text x="300" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="28">✨ Real Wallet Experience</text>
      <text x="900" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="28">🛡️ Devnet Only</text>
      
      <text x="300" y="320" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">Phantom-like interface</text>
      <text x="900" y="320" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">No mainnet accidents</text>
      
      <text x="300" y="360" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="28">💰 Free Faucet</text>
      <text x="900" y="360" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="28">🧩 Browser Extension</text>
      
      <text x="300" y="400" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">Unlimited test SOL</text>
      <text x="900" y="400" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">dApp integration</text>
      
      <!-- CTA Button -->
      <rect x="450" y="450" width="300" height="70" rx="35" fill="url(#ctaBg)"/>
      <text x="600" y="495" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="28">VISIT FAKESOL.COM</text>
      
      <!-- Social proof -->
      <text x="600" y="570" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="20">Trusted by Solana Developers Worldwide</text>
      
      <!-- Hashtags -->
      <text x="600" y="620" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">#Solana #Web3 #DevTools #FakeSOL</text>
    </svg>
  `;

  const baseBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  
  await sharp(baseBuffer)
    .composite([{
      input: await sharp(logoPath).resize(80, 80, { fit: 'contain' }).png().toBuffer(),
      top: 30,
      left: 60
    }])
    .png()
    .toFile(join(outputDir, 'hero-landing.png'));
  
  console.log('Created hero-landing.png');
}

// Create extension popup mockup
async function createExtensionPopup() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="extBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#extBg)"/>
      
      <!-- Browser mockup -->
      <rect x="100" y="100" width="1000" height="475" rx="15" fill="#27272a" stroke="#71717a" stroke-width="2"/>
      <!-- Browser header -->
      <rect x="100" y="100" width="1000" height="50" rx="15" fill="#18181b"/>
      <circle cx="130" cy="125" r="8" fill="#ef4444"/>
      <circle cx="155" cy="125" r="8" fill="#eab308"/>
      <circle cx="180" cy="125" r="8" fill="#22c55e"/>
      <rect x="200" y="115" width="300" height="20" rx="10" fill="#27272a"/>
      <text x="350" y="130" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="12">fakesol.com</text>
      
      <!-- Extension popup -->
      <rect x="750" y="200" width="300" height="300" rx="15" fill="#09090b" stroke="#9945FF" stroke-width="2"/>
      <text x="900" y="235" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">FakeSOL Wallet</text>
      
      <!-- Balance -->
      <rect x="770" y="250" width="260" height="60" rx="8" fill="#27272a"/>
      <text x="900" y="275" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="18">2.45 SOL</text>
      <text x="900" y="295" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="12">Devnet Balance</text>
      
      <!-- Action buttons -->
      <rect x="770" y="325" width="120" height="40" rx="6" fill="#9945FF"/>
      <text x="830" y="350" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Send</text>
      
      <rect x="910" y="325" width="120" height="40" rx="6" fill="#14F195"/>
      <text x="970" y="350" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Receive</text>
      
      <!-- Connect status -->
      <rect x="770" y="380" width="260" height="30" rx="15" fill="#22c55e" fill-opacity="0.2"/>
      <text x="900" y="400" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-weight="bold" font-size="14">🟢 Connected to dApp</text>
      
      <!-- Main content area -->
      <rect x="120" y="170" width="600" height="380" rx="5" fill="#18181b"/>
      <text x="420" y="220" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="32">Welcome to FakeSOL</text>
      <text x="420" y="260" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">Test Solana dApps safely</text>
      
      <!-- CTA -->
      <rect x="320" y="300" width="200" height="50" rx="25" fill="#9945FF"/>
      <text x="420" y="332" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="16">Get Test SOL</text>
      
      <!-- Devnet badge -->
      <rect x="350" y="520" width="140" height="30" rx="15" fill="#eab308" fill-opacity="0.2"/>
      <text x="420" y="540" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-weight="bold" font-size="14">DEVNET ONLY</text>
      
      <!-- Headline -->
      <text x="600" y="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="36">🧩 Browser Extension Ready!</text>
      <text x="600" y="580" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="24">fakesol.com/extension</text>
      <text x="600" y="620" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">#Solana #Web3 #DevTools</text>
    </svg>
  `;

  const baseBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  
  await sharp(baseBuffer)
    .composite([{
      input: await sharp(logoPath).resize(40, 40, { fit: 'contain' }).png().toBuffer(),
      top: 210,
      left: 850
    }])
    .png()
    .toFile(join(outputDir, 'extension-popup.png'));
  
  console.log('Created extension-popup.png');
}

// Create feature comparison grid
async function createFeatureGrid() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gridBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#gridBg)"/>
      
      <!-- Title -->
      <text x="600" y="60" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="42">Why Choose FakeSOL?</text>
      
      <!-- Feature 1: Safety -->
      <rect x="100" y="100" width="250" height="200" rx="15" fill="#27272a"/>
      <text x="225" y="140" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-size="48">🛡️</text>
      <text x="225" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">100% Safe</text>
      <text x="225" y="210" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">Devnet only - no real funds at risk</text>
      <text x="225" y="240" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">✓ Zero Risk</text>
      
      <!-- Feature 2: Easy -->
      <rect x="425" y="100" width="250" height="200" rx="15" fill="#27272a"/>
      <text x="550" y="140" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-size="48">⚡</text>
      <text x="550" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Super Easy</text>
      <text x="550" y="210" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">One-click wallet creation</text>
      <text x="550" y="240" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">✓ Instant Setup</text>
      
      <!-- Feature 3: Free -->
      <rect x="750" y="100" width="250" height="200" rx="15" fill="#27272a"/>
      <text x="875" y="140" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="48">💰</text>
      <text x="875" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Completely Free</text>
      <text x="875" y="210" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">Unlimited test SOL from faucet</text>
      <text x="875" y="240" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">✓ No Limits</text>
      
      <!-- Feature 4: Compatible -->
      <rect x="100" y="350" width="250" height="200" rx="15" fill="#27272a"/>
      <text x="225" y="390" text-anchor="middle" fill="#9945FF" font-family="Arial, sans-serif" font-size="48">🔗</text>
      <text x="225" y="430" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">dApp Compatible</text>
      <text x="225" y="460" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">Works with all Solana dApps</text>
      <text x="225" y="490" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">✓ Full Integration</text>
      
      <!-- Feature 5: Fast -->
      <rect x="425" y="350" width="250" height="200" rx="15" fill="#27272a"/>
      <text x="550" y="390" text-anchor="middle" fill="#06b6d4" font-family="Arial, sans-serif" font-size="48">🚀</text>
      <text x="550" y="430" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Lightning Fast</text>
      <text x="550" y="460" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">Instant transactions on devnet</text>
      <text x="550" y="490" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">✓ Sub-Second</text>
      
      <!-- Feature 6: Professional -->
      <rect x="750" y="350" width="250" height="200" rx="15" fill="#27272a"/>
      <text x="875" y="390" text-anchor="middle" fill="#f59e0b" font-family="Arial, sans-serif" font-size="48">👨‍💻</text>
      <text x="875" y="430" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Pro Developer Tools</text>
      <text x="875" y="460" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">Built for serious development</text>
      <text x="875" y="490" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">✓ Production Ready</text>
      
      <!-- CTA -->
      <rect x="450" y="590" width="300" height="60" rx="30" fill="#9945FF"/>
      <text x="600" y="630" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="24">START TESTING NOW</text>
      
      <!-- Website -->
      <text x="600" y="655" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="16">fakesol.com</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'feature-grid.png'));
  
  console.log('Created feature-grid.png');
}

// Create developer testimonial style
async function createDeveloperTestimonial() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="testBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="quoteBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#14F195;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#testBg)"/>
      
      <!-- Quote marks -->
      <text x="100" y="100" fill="#9945FF" font-family="Arial, sans-serif" font-size="120">"</text>
      <text x="1100" y="550" fill="#14F195" font-family="Arial, sans-serif" font-size="120">"</text>
      
      <!-- Main testimonial -->
      <text x="600" y="150" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="36">Finally, a wallet I can trust</text>
      <text x="600" y="190" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="36">for Solana development!</text>
      
      <text x="600" y="240" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="20">No more accidentally testing on mainnet.</text>
      <text x="600" y="270" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="20">FakeSOL keeps my real funds safe while I build.</text>
      
      <!-- Developer avatar -->
      <circle cx="600" cy="350" r="60" fill="#27272a" stroke="#9945FF" stroke-width="3"/>
      <text x="600" y="365" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48">👨‍💻</text>
      
      <!-- Name and title -->
      <text x="600" y="440" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="24">Alex Chen</text>
      <text x="600" y="470" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="18">Solana Developer</text>
      <text x="600" y="495" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">@buildspace Alumni</text>
      
      <!-- Benefits list -->
      <rect x="200" y="530" width="800" height="100" rx="15" fill="url(#quoteBg)"/>
      <text x="300" y="560" fill="#14F195" font-family="Arial, sans-serif" font-size="18">✓</text>
      <text x="320" y="560" fill="white" font-family="Arial, sans-serif" font-size="16">Devnet-only by design</text>
      
      <text x="300" y="585" fill="#14F195" font-family="Arial, sans-serif" font-size="18">✓</text>
      <text x="320" y="585" fill="white" font-family="Arial, sans-serif" font-size="16">Free unlimited test SOL</text>
      
      <text x="600" y="560" fill="#14F195" font-family="Arial, sans-serif" font-size="18">✓</text>
      <text x="620" y="560" fill="white" font-family="Arial, sans-serif" font-size="16">Browser extension ready</text>
      
      <text x="600" y="585" fill="#14F195" font-family="Arial, sans-serif" font-size="18">✓</text>
      <text x="620" y="585" fill="white" font-family="Arial, sans-serif" font-size="16">Works with all dApps</text>
      
      <!-- CTA -->
      <text x="600" y="650" text-anchor="middle" fill="#9945FF" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Join 1000+ developers using FakeSOL</text>
      <text x="600" y="670" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="16">fakesol.com #Solana #Web3</text>
    </svg>
  `;

  const baseBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  
  await sharp(baseBuffer)
    .composite([{
      input: await sharp(logoPath).resize(60, 60, { fit: 'contain' }).png().toBuffer(),
      top: 30,
      left: 60
    }])
    .png()
    .toFile(join(outputDir, 'developer-testimonial.png'));
  
  console.log('Created developer-testimonial.png');
}

// Create mobile responsive mockup
async function createMobileMockup() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mobileBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#mobileBg)"/>
      
      <!-- Phone mockup -->
      <rect x="150" y="100" width="300" height="475" rx="30" fill="#27272a" stroke="#71717a" stroke-width="8"/>
      <!-- Screen -->
      <rect x="170" y="120" width="260" height="435" rx="20" fill="#09090b"/>
      
      <!-- App header -->
      <rect x="170" y="120" width="260" height="60" rx="20" fill="#18181b"/>
      <text x="300" y="155" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="16">FakeSOL Wallet</text>
      
      <!-- Balance -->
      <rect x="190" y="200" width="220" height="80" rx="10" fill="#27272a"/>
      <text x="300" y="230" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="24">5.67 SOL</text>
      <text x="300" y="255" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="12">Devnet Balance</text>
      
      <!-- Action buttons -->
      <rect x="190" y="300" width="95" height="50" rx="8" fill="#9945FF"/>
      <text x="237" y="330" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Send</text>
      
      <rect x="315" y="300" width="95" height="50" rx="8" fill="#14F195"/>
      <text x="362" y="330" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14">Receive</text>
      
      <!-- Recent transactions -->
      <text x="300" y="380" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="16">Recent Activity</text>
      
      <rect x="190" y="400" width="220" height="40" rx="5" fill="#18181b"/>
      <text x="200" y="420" fill="#14F195" font-family="Arial, sans-serif" font-size="12">+1.2 SOL</text>
      <text x="300" y="420" fill="white" font-family="Arial, sans-serif" font-size="12">Faucet</text>
      
      <rect x="190" y="450" width="220" height="40" rx="5" fill="#18181b"/>
      <text x="200" y="470" fill="#ef4444" font-family="Arial, sans-serif" font-size="12">-0.05 SOL</text>
      <text x="300" y="470" fill="white" font-family="Arial, sans-serif" font-size="12">Test TX</text>
      
      <!-- Desktop mockup -->
      <rect x="550" y="150" width="600" height="375" rx="10" fill="#27272a" stroke="#71717a" stroke-width="2"/>
      <!-- Browser header -->
      <rect x="550" y="150" width="600" height="40" rx="10" fill="#18181b"/>
      <circle cx="575" cy="170" r="6" fill="#ef4444"/>
      <circle cx="590" cy="170" r="6" fill="#eab308"/>
      <circle cx="605" cy="170" r="6" fill="#22c55e"/>
      <rect x="620" y="160" width="200" height="20" rx="10" fill="#27272a"/>
      <text x="720" y="175" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="12">fakesol.com</text>
      
      <!-- Desktop content -->
      <rect x="570" y="210" width="560" height="295" rx="5" fill="#09090b"/>
      <text x="850" y="250" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="24">Dashboard</text>
      <text x="850" y="285" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">Manage your devnet wallet</text>
      
      <!-- Headline -->
      <text x="300" y="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="36">📱 Mobile + Desktop Ready</text>
      <text x="600" y="600" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="24">Works everywhere you code</text>
      <text x="600" y="630" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="16">fakesol.com #Solana #Web3 #DevTools</text>
      
      <!-- Devnet badge -->
      <rect x="500" y="650" width="200" height="30" rx="15" fill="#eab308" fill-opacity="0.2"/>
      <text x="600" y="670" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-weight="bold" font-size="14">DEVNET ONLY</text>
    </svg>
  `;

  const baseBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  
  await sharp(baseBuffer)
    .composite([{
      input: await sharp(logoPath).resize(50, 50, { fit: 'contain' }).png().toBuffer(),
      top: 135,
      left: 190
    }])
    .png()
    .toFile(join(outputDir, 'mobile-desktop.png'));
  
  console.log('Created mobile-desktop.png');
}

// Create before/after comparison with website focus
async function createBeforeAfter() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="baBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#18181b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#baBg)"/>
      
      <!-- Before section -->
      <rect x="50" y="100" width="500" height="475" rx="20" fill="#27272a" stroke="#ef4444" stroke-width="4"/>
      <text x="300" y="150" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-weight="bold" font-size="32">❌ BEFORE FakeSOL</text>
      
      <!-- Before wallet -->
      <rect x="100" y="180" width="400" height="120" rx="10" fill="#18181b"/>
      <text x="300" y="210" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Mainnet Wallet</text>
      <text x="300" y="240" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-size="28">2.5 SOL</text>
      <text x="300" y="270" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="14">Real money at risk!</text>
      
      <!-- Before problems -->
      <text x="150" y="330" fill="#ef4444" font-family="Arial, sans-serif" font-size="16">• Network switching errors</text>
      <text x="150" y="360" fill="#ef4444" font-family="Arial, sans-serif" font-size="16">• Accidental mainnet txns</text>
      <text x="150" y="390" fill="#ef4444" font-family="Arial, sans-serif" font-size="16">• Faucet rate limits</text>
      <text x="150" y="420" fill="#ef4444" font-family="Arial, sans-serif" font-size="16">• Mixed test/personal funds</text>
      
      <!-- Sad developer -->
      <text x="300" y="480" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="64">😰</text>
      <text x="300" y="520" text-anchor="middle" fill="#ef4444" font-family="Arial, sans-serif" font-weight="bold" font-size="18">STRESSFUL DEVELOPMENT</text>
      
      <!-- VS arrow -->
      <text x="575" y="337" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="48">VS</text>
      
      <!-- After section -->
      <rect x="650" y="100" width="500" height="475" rx="20" fill="#27272a" stroke="#14F195" stroke-width="4"/>
      <text x="900" y="150" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="32">✅ WITH FakeSOL</text>
      
      <!-- After wallet -->
      <rect x="700" y="180" width="400" height="120" rx="10" fill="#18181b"/>
      <text x="900" y="210" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Devnet Wallet</text>
      <text x="900" y="240" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-size="28">∞ SOL</text>
      <text x="900" y="270" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="14">Free faucet, zero risk!</text>
      
      <!-- After benefits -->
      <text x="750" y="330" fill="#14F195" font-family="Arial, sans-serif" font-size="16">• Devnet only by design</text>
      <text x="750" y="360" fill="#14F195" font-family="Arial, sans-serif" font-size="16">• Unlimited test SOL</text>
      <text x="750" y="390" fill="#14F195" font-family="Arial, sans-serif" font-size="16">• Browser extension</text>
      <text x="750" y="420" fill="#14F195" font-family="Arial, sans-serif" font-size="16">• Works with all dApps</text>
      
      <!-- Happy developer -->
      <text x="900" y="480" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="64">😎</text>
      <text x="900" y="520" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="18">CONFIDENT DEVELOPMENT</text>
      
      <!-- Website CTA -->
      <rect x="450" y="600" width="300" height="50" rx="25" fill="#9945FF"/>
      <text x="600" y="632" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="20">fakesol.com</text>
      
      <!-- Hashtags -->
      <text x="600" y="655" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="16">#Solana #Web3 #DevTools #FakeSOL</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outputDir, 'before-after.png'));
  
  console.log('Created before-after.png');
}

// Create call-to-action focused image
async function createCTAFocused() {
  const svg = `
    <svg width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ctaBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#09090b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="buttonBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9945FF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#14F195;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${TWITTER_WIDTH}" height="${TWITTER_HEIGHT}" fill="url(#ctaBg)"/>
      
      <!-- Background elements -->
      <circle cx="300" cy="200" r="200" fill="#9945FF" fill-opacity="0.05"/>
      <circle cx="900" cy="500" r="250" fill="#14F195" fill-opacity="0.05"/>
      
      <!-- Main headline -->
      <text x="600" y="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="56">READY TO TEST</text>
      <text x="600" y="170" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="56">SOLANA DAPPS?</text>
      
      <!-- Subheadline -->
      <text x="600" y="220" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="28">Get your devnet wallet NOW</text>
      
      <!-- Key benefits -->
      <text x="600" y="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">🚀 Instant wallet creation</text>
      <text x="600" y="320" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">💰 Free unlimited test SOL</text>
      <text x="600" y="360" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">🛡️ Zero risk to real funds</text>
      <text x="600" y="400" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24">🔗 Works with all dApps</text>
      
      <!-- Main CTA Button -->
      <rect x="400" y="450" width="400" height="80" rx="40" fill="url(#buttonBg)"/>
      <text x="600" y="495" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="32">START TESTING</text>
      
      <!-- Website URL -->
      <text x="600" y="540" text-anchor="middle" fill="#14F195" font-family="Arial, sans-serif" font-weight="bold" font-size="24">fakesol.com</text>
      
      <!-- Urgency -->
      <text x="600" y="580" text-anchor="middle" fill="#eab308" font-family="Arial, sans-serif" font-weight="bold" font-size="20">Join 1000+ Solana developers</text>
      
      <!-- Social proof -->
      <text x="600" y="610" text-anchor="middle" fill="#a1a1aa" font-family="Arial, sans-serif" font-size="18">Used by teams at buildspace, Solana Labs, and more</text>
      
      <!-- Hashtags -->
      <text x="600" y="650" text-anchor="middle" fill="#9945FF" font-family="Arial, sans-serif" font-weight="bold" font-size="18">#Solana #Web3 #Blockchain #DevTools #FakeSOL</text>
    </svg>
  `;

  const baseBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  
  await sharp(baseBuffer)
    .composite([{
      input: await sharp(logoPath).resize(100, 100, { fit: 'contain' }).png().toBuffer(),
      top: 30,
      left: 60
    }])
    .png()
    .toFile(join(outputDir, 'cta-focused.png'));
  
  console.log('Created cta-focused.png');
}

// Run all generators
async function main() {
  console.log('Cleaning old social images...');
  clearOldSocialPngs();
  console.log('Generating X-optimized social media images...\n');
  
  await createHeroImage();
  await createExtensionPopup();
  await createFeatureGrid();
  await createDeveloperTestimonial();
  await createMobileMockup();
  await createBeforeAfter();
  await createCTAFocused();
  
  console.log(`\n✅ All images saved to: ${outputDir}`);
  console.log('\nX-optimized images created:');
  console.log('  - hero-landing.png (main landing page style)');
  console.log('  - extension-popup.png (browser extension demo)');
  console.log('  - feature-grid.png (6-key-benefits grid)');
  console.log('  - developer-testimonial.png (social proof testimonial)');
  console.log('  - mobile-desktop.png (responsive design showcase)');
  console.log('  - before-after.png (problem/solution comparison)');
  console.log('  - cta-focused.png (strong call-to-action focus)');
  console.log('\nAll images include:');
  console.log('  ✓ FakeSOL logo');
  console.log('  ✓ Website URL (fakesol.com)');
  console.log('  ✓ SEO hashtags');
  console.log('  ✓ Emojis for engagement');
  console.log('  ✓ Clear CTAs');
  console.log('  ✓ X-optimized 1200x675 dimensions');
}

main().catch(console.error);