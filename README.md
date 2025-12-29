# 🪙 FakeSOL

The devnet-only Solana wallet. **Real testing. Fake SOL.**

![Solana Devnet](https://img.shields.io/badge/Network-Devnet-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)

## Features

- ✨ **Create or Import Wallets** - Generate new keypairs or import existing ones
- � **Account System** - Sign up with email to save wallets across devices
- 👛 **Multi-Wallet Support** - Manage multiple wallets with custom names
- 🚰 **Devnet Airdrop** - Get free test SOL with one click
- 📤 **Send SOL** - Transfer devnet SOL to any address
- 📥 **Receive SOL** - Display your address for receiving tokens
- 📜 **Transaction History** - View recent transactions with Explorer links
- 🔐 **Secure Storage** - Encrypted wallets stored locally or in database
- 📊 **Analytics** - Track signups and user activity (admin)
- 🎨 **Beautiful UI** - Dark theme with Solana gradient accents

## Architecture

```
fakesol/
├── src/                 # React Frontend (Vite)
│   ├── components/      # Reusable UI components
│   ├── pages/           # Dashboard, Send, Receive, Login, Register
│   ├── lib/             # Solana SDK & API client
│   └── store/           # Zustand state management (auth + wallet)
├── server/              # Express Backend API
│   └── src/
│       ├── index.ts     # Server entry point
│       ├── routes.ts    # Wallet API endpoints
│       ├── routes/
│       │   ├── auth.ts  # Authentication endpoints
│       │   └── admin.ts # Admin analytics endpoints
│       ├── lib/
│       │   └── prisma.ts # Database client
│       └── solana.ts    # Solana RPC wrapper
│   └── prisma/
│       └── schema.prisma # Database schema
└── public/              # Static assets
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Or install separately
npm install
cd server && npm install
```

### Development

```bash
# Run frontend only (connects directly to Solana devnet)
npm run dev

# Run backend only
npm run dev:server

# Run both frontend and backend together
npm run dev:all
```

### Production Build

```bash
# Build everything
npm run build:all
```

## Solana CLI (Optional)

Install Solana CLI for local development and testing:

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Add to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Configure for devnet
solana config set --url devnet

# Generate a keypair
solana-keygen new

# Check balance
solana balance

# Request airdrop
solana airdrop 1
```

## API Endpoints

The backend server provides these REST endpoints:

### Wallet API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check & cluster info |
| `/api/wallet/generate` | POST | Generate new keypair |
| `/api/wallet/validate/:address` | GET | Validate Solana address |
| `/api/wallet/:address/balance` | GET | Get wallet balance |
| `/api/wallet/:address/airdrop` | POST | Request devnet airdrop |
| `/api/wallet/:address/transactions` | GET | Get transaction history |
| `/api/transaction/:signature` | GET | Get transaction details |
| `/api/transaction/send` | POST | Send SOL transaction |

### Auth API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/wallets` | POST | Create new wallet |
| `/api/auth/wallets/:id` | PATCH | Rename wallet |
| `/api/auth/wallets/:id` | DELETE | Delete wallet |
| `/api/auth/wallets/import` | POST | Import wallet |

### Admin API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/signups` | GET | Get signup analytics |
| `/api/admin/events` | GET | Get event analytics |
| `/api/admin/emails` | GET | Export user emails |

## Tech Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Zustand** - State Management
- **@solana/web3.js** - Solana SDK

### Backend
- **Express** - Node.js Web Framework
- **TypeScript** - Type Safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **@solana/web3.js** - Solana SDK
- **express-rate-limit** - Rate limiting

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001
```

### Backend (server/.env)
```bash
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com

# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fakesol

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-32-character-encryption-key!

# Admin
ADMIN_API_KEY=your-admin-api-key-change-in-production
```

## ⚠️ Important

This wallet is **DEVNET ONLY**. It's designed for developers testing Solana dApps. Never send real SOL to addresses generated by this wallet.

## License

MIT
