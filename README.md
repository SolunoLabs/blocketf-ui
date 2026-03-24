# BlockETF UI

Next.js frontend for the live BlockETF V2 product on BNB Chain.

## Scope

This app is now focused on the live V2 mainnet experience:

- Featured ETF: `BlockETF TOP Index`
- Symbol: `TOP`
- Network: `BNB Chain`
- V2 stack: `Core + Lens + Router + Rebalancer`
- Wallet UX: `RainbowKit + wagmi`

V1 remains available as a legacy route under `/v1`, but V2 is the primary app surface.

## Live Mainnet Contracts

- Factory: `0x1362EF9Bf354E4CdEc2385fB341091a546874648`
- Router: `0x830Fd956dcB3f4F00325BA024AB7D2665faDA6C1`
- Rebalancer: `0xcFf620c18af87dC5aF8959C0A4Ece22BE0702231`
- Lens: `0xc3901bbB95B9494F10243f0F12e22DeC0Eb95cC5`
- Price Oracle: `0x589255724D4ce034D5d94c2dD4A05EaB11F74F90`
- Featured ETF: `0xF61E981654AD8868872304A4F617d61E25cEf69B`
- USDT: `0x55d398326f99059fF775485246999027B3197955`

## Environment Variables

None required for production deployment.

V2 mainnet contract addresses and the WalletConnect project ID are fixed in code so GitHub -> Vercel deployments do not depend on dashboard environment variables.

`.env.local` is optional for local experimentation only.

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Validate before shipping:

```bash
npm run lint
npm run build
```

## Deployment

This repo is intended to deploy through GitHub -> Vercel.

Recommended Vercel setup:

- Framework Preset: `Next.js`
- Build Command: `next build`
- Install Command: `npm install`
- Output Directory: leave default

No required Vercel environment variables for the main app.

## Project Structure

```text
src/
  app/
    page.tsx            V2 featured ETF homepage
    about/page.tsx      About page
    etf/[address]/      ETF detail route
    v1/page.tsx         V1 legacy route
  components/
    v2/                 V2 product UI
    v1/                 V1 legacy UI
    ui/                 shared primitive components
  hooks/
    v2/                 V2 read/write hooks
  lib/
    contracts/          ABIs, addresses, config
    wagmi.ts            wallet and chain config
public/
  blocketf-mark-mono.svg
```

## Notes

- V2 no longer exposes testnet as an active network in the main app UI.
- The header explicitly shows `BNB Chain` to make the supported network clear for new users.
- Some legacy files still exist for V1 and faucet flows, but they are not part of the active V2 deployment path.
