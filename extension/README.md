# FakeSOL Chrome Extension

The devnet-only Solana wallet extension for developers. Works just like Phantom, Backpack, or Solflare — but exclusively on Solana Devnet.

## Features

- ✅ Import wallets created on fakesol.com
- ✅ Connect to dApps via `window.solana` (Wallet Standard)
- ✅ Sign transactions and messages
- ✅ Devnet only — no risk of real funds

## Installation

### From Source (Developer Mode)

1. Build the extension:
   ```bash
   cd extension
   npm install
   npm run build
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top right)

4. Click **Load unpacked** and select the `extension/dist` folder

5. The FakeSOL wallet icon should appear in your extensions bar

## Usage

### Import Your Wallet

1. Click the FakeSOL extension icon
2. Paste your private key (Base58 format) from the FakeSOL web app
3. Click **Import Wallet**

### Connect to a dApp

The extension injects `window.solana` just like Phantom. Any dApp that supports Phantom will work with FakeSOL.

```javascript
// In your dApp
const provider = window.solana;

// Connect
const { publicKey } = await provider.connect();
console.log('Connected:', publicKey.toString());

// Sign a transaction
const signedTx = await provider.signTransaction(transaction);

// Sign a message
const { signature } = await provider.signMessage(message);
```

## Development

```bash
# Install dependencies
npm install

# Build (outputs to dist/)
npm run build

# Watch mode (for development)
npm run dev
```

## Security Notes

- ⚠️ **DEVNET ONLY** - This wallet only works on Solana Devnet
- Private keys are stored in Chrome's local storage (encrypted by Chrome)
- Never use this wallet with real funds or on mainnet
- Auto-approves all transactions (suitable for testing only)

## Project Structure

```
extension/
├── src/
│   ├── popup/        # Extension popup UI (React)
│   ├── background/   # Service worker (handles signing)
│   ├── content/      # Content script (message bridge)
│   ├── inpage/       # Injected provider (window.solana)
│   └── types/        # TypeScript declarations
├── dist/             # Built extension (load this in Chrome)
├── icons/            # Extension icons
└── manifest.json     # Chrome extension manifest
```
