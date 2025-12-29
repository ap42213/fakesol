# Chrome Web Store Submission Guide

## Prerequisites

1. **Developer Account**: Register at https://chrome.google.com/webstore/devconsole ($5 one-time fee)
2. **Extension ZIP**: Already built at `extension/dist/` (or download from fakesol.com)
3. **Store Assets**: Generated in `extension/store-assets/`

## Store Listing Information

### Basic Info

**Name**: FakeSOL Wallet

**Summary** (132 chars max):
```
Devnet-only Solana wallet for developers. Connect to dApps, sign transactions, test your programs. No real funds at risk.
```

**Description** (16,000 chars max):
```
🪙 FakeSOL Wallet - The Devnet-Only Solana Wallet for Developers

FakeSOL is a Chrome extension wallet designed specifically for Solana developers. It works just like Phantom, Backpack, or Solflare — but exclusively on Solana Devnet.

✨ FEATURES

🔌 Connect to dApps
Works with any Solana application that supports wallet adapters. Your dApp will detect FakeSOL just like it would detect Phantom.

✍️ Sign Transactions
Approve and sign transactions for your Solana programs during development and testing.

🛡️ Devnet Only
Safe testing environment — no risk of real funds. Perfect for testing before deploying to mainnet.

📥 Easy Import
Import wallets created on fakesol.com with one click. Just paste your private key.

🔄 Wallet Standard Compatible
Exposes window.solana just like Phantom, ensuring compatibility with all Solana dApps.

👨‍💻 WHO IS THIS FOR?

• Solana developers testing dApps
• Frontend developers building wallet integrations
• QA teams testing Solana applications
• Anyone learning Solana development

⚠️ IMPORTANT

This wallet ONLY works on Solana Devnet. It cannot connect to mainnet and will not work with real SOL. This is by design — FakeSOL is meant for safe, risk-free development testing.

🔒 SECURITY

• Private keys are stored locally in Chrome's encrypted storage
• No data is transmitted to external servers
• Open source code available on GitHub
• No analytics or tracking

🌐 GETTING STARTED

1. Install the extension
2. Click the FakeSOL icon
3. Import your wallet from fakesol.com (or create one there first)
4. Connect to any Solana dApp and start testing!

📖 DOCUMENTATION

Full documentation available at: https://github.com/ap42213/fakesol

🐛 ISSUES & FEEDBACK

Report bugs or request features: https://github.com/ap42213/fakesol/issues

Made with 💜 for the Solana developer community
```

### Category
**Primary**: Developer Tools

### Language
English

### Visibility
Public

## Required Assets

| Asset | Size | File |
|-------|------|------|
| Icon | 128x128 | `extension/icons/icon128.png` |
| Screenshot 1 | 1280x800 | `store-assets/screenshot-1280x800.png` |
| Small Promo Tile | 440x280 | `store-assets/promo-tile-440x280.png` |
| Marquee Promo | 1400x560 | `store-assets/marquee-1400x560.png` |

## Privacy Practices

When filling out the privacy practices questionnaire:

### Single Purpose
```
This extension provides a Solana Devnet wallet for developers to test their dApps.
```

### Permission Justifications

**storage**: Required to save the user's wallet private key locally

**activeTab**: Required to inject the wallet provider into the current page

**scripting**: Required to inject content scripts for wallet connection

**Host Permissions (<all_urls>)**: Required to allow wallet connections on any website the user visits

### Data Usage

- [ ] Personally identifiable information - **NO**
- [ ] Health information - **NO**
- [ ] Financial and payment information - **NO** (devnet only, no real value)
- [ ] Authentication information - **YES** (private keys stored locally only)
- [ ] Personal communications - **NO**
- [ ] Location - **NO**
- [ ] Web history - **NO**
- [ ] User activity - **NO**

**Data is stored locally only, never transmitted.**

## Submission Steps

1. Go to https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload the ZIP file from `extension/dist/`
4. Fill in Store Listing with info above
5. Upload screenshots and promotional images
6. Complete Privacy Practices questionnaire
7. Submit for Review

## Review Timeline

- Initial review: 1-3 business days
- If rejected, fix issues and resubmit
- Once approved, extension goes live immediately

## After Approval

Update the extension:
1. Bump version in `manifest.prod.json`
2. Rebuild: `npm run build`
3. Upload new ZIP to developer console
4. Submit for review

---

💡 **Tip**: Keep your developer account credentials safe. You'll need them to update the extension in the future.
