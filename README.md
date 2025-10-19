# BlockETF Frontend

A modern, decentralized ETF platform built on Binance Smart Chain (BSC), enabling users to invest in diversified crypto portfolios through a simple and intuitive interface.

🌐 **Official Website**: [https://block-etf.com](https://block-etf.com)

## Overview

BlockETF brings the concept of traditional Exchange-Traded Funds (ETFs) to the cryptocurrency space. Users can gain diversified exposure to multiple mainstream crypto assets through a single token (CT5 - Crypto Top 5 Index), without the need to purchase and manage each asset individually.

### What is CT5?

CT5 (Crypto Top 5 Index) is BlockETF's flagship product that tracks the top five mainstream cryptocurrencies available on BSC:

| Asset | Weight | Description      |
| ----- | ------ | ---------------- |
| BTCB  | 20%    | Wrapped Bitcoin  |
| ETH   | 20%    | Wrapped Ethereum |
| WBNB  | 20%    | Wrapped BNB      |
| XRP   | 20%    | Ripple           |
| SOL   | 20%    | Solana           |

**Base Asset**: USDT

## Features

### 🔗 Wallet Integration

- **RainbowKit** powered wallet connection
- Support for MetaMask, WalletConnect, Coinbase Wallet, and more
- Automatic network detection and switching
- Mobile-optimized wallet interface

### 💰 Trading Interface

- **Invest Mode**: Purchase ETF shares with USDT
- **Redeem Mode**: Sell ETF shares for USDT
- **Automatic Authorization**: Smart approval flow for USDT and ETF shares
- **Slippage Control**: Configurable slippage tolerance (3%, 5%, 10%, 15% or custom)
- **MAX Button**: One-click maximum amount calculation
- **Real-time Previews**: See exact amounts before confirming

### 📊 Portfolio Dashboard

- **ETF Overview**:
  - Current share price with 24h change
  - Total Value Locked (TVL)
  - Total supply of shares
  - Real-time asset composition with Chainlink price feeds
- **My Holdings**:
  - Your ETF share balance
  - Current value in USDT
  - Responsive design for mobile and desktop

### 🔔 Transaction Notifications

- **Toast System**: Uniswap-style lightweight notifications
- **Real-time Updates**: Loading, success, and error states
- **BSCScan Integration**: Direct links to view transactions on block explorer
- **Auto-refresh**: Data updates automatically after transaction confirmation

### 💧 Testnet Faucet

- **Free Test Tokens**: Claim USDT, WBTC, WETH, WBNB on BSC Testnet
- **24-hour Cooldown**: Fair distribution mechanism
- **Balance Display**: Real-time token balance tracking
- **One-click Claiming**: Simple and fast token distribution

### 🎨 User Experience

- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Theme**: Eye-friendly dark mode throughout
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Clear error messages and retry mechanisms

## Tech Stack

### Core Framework

- **Next.js 15** - React framework with App Router and Server Components
- **TypeScript** - Type-safe development with full type coverage
- **Tailwind CSS** - Utility-first styling with custom design system

### Web3 Integration

- **wagmi v2** - React hooks for Ethereum with TypeScript support
- **viem** - TypeScript Ethereum library for contract interactions
- **RainbowKit** - Beautiful wallet connection UI
- **TanStack Query** - Data fetching, caching, and synchronization

### Smart Contract ABIs

- `blockETFCoreABI` - Core ETF contract (shares, assets, fees)
- `etfRouterABI` - Router contract (trading, previews)
- `erc20ABI` - Standard ERC20 token interface
- `priceOracleABI` - Chainlink price oracle integration

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with Web3 providers
│   ├── page.tsx                # Home page (ETF trading dashboard)
│   ├── about/
│   │   └── page.tsx            # About page (project info)
│   └── faucet/
│       └── page.tsx            # Faucet page (testnet tokens)
├── components/
│   ├── Providers.tsx           # Web3 providers (wagmi, RainbowKit, TanStack Query)
│   ├── ETFOverview.tsx         # ETF information and asset composition
│   ├── MyHoldings.tsx          # User's ETF holdings display
│   ├── TradePanel.tsx          # Trading interface (invest/redeem)
│   ├── Toast.tsx               # Transaction notification system
│   └── TransactionModal.tsx    # (Legacy) Transaction status modal
├── hooks/
│   └── useBlockETF.ts          # Custom hooks for ETF data fetching
└── lib/
    ├── wagmi.ts                # wagmi and RainbowKit configuration
    └── contracts/
        ├── abis.ts             # Smart contract ABIs
        └── addresses.ts        # Contract address mappings
```

## Key Features Explained

### Trading Flow

#### Invest (Buy ETF Shares)

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Enter Amount**: Input the number of ETF shares you want to buy
3. **Approve USDT**: First-time users need to approve USDT spending (one-time)
4. **Preview**: See the exact USDT amount needed (including slippage)
5. **Invest**: Confirm transaction in your wallet
6. **Success**: Receive CT5 shares and see updated holdings

#### Redeem (Sell ETF Shares)

1. **Switch to Redeem**: Toggle to "Redeem" mode
2. **Enter Amount**: Input the number of shares to sell (or click MAX)
3. **Approve Shares**: First-time users need to approve ETF share spending
4. **Preview**: See the USDT amount you'll receive (after slippage)
5. **Redeem**: Confirm transaction in your wallet
6. **Success**: Receive USDT and see updated holdings

### Authorization System

The app implements a smart authorization system that:

- Automatically detects when approval is needed
- Shows "Approve USDT" or "Approve ETF Shares" button when required
- Uses `maxUint256` for unlimited allowance (gas-efficient, one-time approval)
- Automatically switches to "Invest Now" or "Redeem Now" after approval
- Handles both USDT (for investing) and ETF shares (for redeeming)

### Slippage Protection

Users can configure slippage tolerance to protect against price movements:

- **Preset Options**: 3%, 5%, 10%, 15%
- **Custom Values**: Set any value between 0-50%
- **Recommendations**:
  - < 3%: ⚠️ May cause transaction failures
  - 3-10%: ✅ Recommended range
  - > 10%: ⚠️ May result in worse prices

### Data Caching & Performance

The app uses TanStack Query for efficient data management:

- **Smart Caching**: Reduces unnecessary blockchain calls
- **Stale Time**: 30-60 seconds for balance queries
- **Auto-refetch**: Data updates after successful transactions
- **Prefetching**: Balance data loaded proactively for smooth UX
- **Mobile Optimization**: Reduced refetch frequency on mobile

## Contract Integration

### Smart Contracts

The frontend interacts with three main contracts:

1. **BlockETFCore** (`0xa63E59DEf7Ab22C17030467E75829C7F90f44d0C`)

   - ERC20 token representing CT5 shares
   - Stores asset allocations and reserves
   - Handles fee collection
   - View on [BscScan](https://testnet.bscscan.com/address/0xa63E59DEf7Ab22C17030467E75829C7F90f44d0C)

2. **ETFRouterV1** (`0xa87f31e7c044260d466727607FF3Aed5c8330743`)

   - Handles single-asset trading (USDT ↔ CT5)
   - Provides price previews
   - Manages DEX interactions
   - View on [BscScan](https://testnet.bscscan.com/address/0xa87f31e7c044260d466727607FF3Aed5c8330743)

3. **PriceOracle**
   - Integrates Chainlink price feeds
   - Provides real-time asset prices
   - Validates price freshness

### Key Functions Used

**Read Functions:**

```typescript
// BlockETFCore
- getAssets() → Asset composition
- balanceOf(address) → User's CT5 balance
- totalSupply() → Total CT5 supply
- getShareValue() → Price per share
- getFeeInfo() → Fee configuration
- allowance(owner, spender) → Approval status

// ETFRouterV1
- usdtNeededForShares(shares) → USDT cost preview
- sharesToUsdt(shares) → USDT received preview
- usdtToShares(usdt) → Share amount estimate

// PriceOracle
- getPrice(asset) → Current USD price
```

**Write Functions:**

```typescript
// ERC20 (USDT & CT5)
- approve(spender, amount) → Grant spending permission

// ETFRouterV1
- mintExactShares(shares, maxUSDT, deadline) → Buy CT5
- burnToUSDT(shares, minUSDT, deadline) → Sell CT5
```

### Custom Hooks

**`useBlockETFData()`** - Main data fetching hook

Returns:

```typescript
{
  assets: Asset[];           // Array of {symbol, address, weight, balance, price}
  totalValue: bigint;        // TVL in USDT (18 decimals)
  totalSupply: bigint;       // Total CT5 shares (18 decimals)
  shareValue: bigint;        // Price per share (18 decimals)
  isPaused: boolean;         // Trading pause status
  etfName: string;           // "Crypto Top 5 Index"
  etfSymbol: string;         // "CT5"
  isLoading: boolean;        // Loading state
}
```

Used in: `page.tsx`, `ETFOverview.tsx`

## Security

### Best Practices Implemented

- ✅ No private keys in code
- ✅ Environment variables for sensitive data
- ✅ Input validation on all user inputs
- ✅ Slippage protection on trades
- ✅ Transaction deadline enforcement
- ✅ Error boundary components
- ✅ Secure RPC endpoints

## License

MIT License - see [LICENSE](LICENSE) file for details

---

**Built with ❤️ by the BlockETF Team**

© 2025 Keegan Soluno Lab. All rights reserved.
