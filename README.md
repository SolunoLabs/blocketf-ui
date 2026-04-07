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

None required for production deployment under the current setup.

V2 mainnet contract addresses and the WalletConnect project ID are fixed in code so GitHub -> Vercel deployments do not depend on dashboard environment variables.

The default subgraph endpoint is also fixed in code and currently points to the Studio deployment:

`https://api.studio.thegraph.com/query/1747541/blocketf-v2/2026-04-07-01`

`.env.local` is optional and can be used to override the default subgraph source for local testing:

```bash
SUBGRAPH_URL=https://api.studio.thegraph.com/query/1747541/blocketf-v2/2026-04-07-01
```

The app resolves the subgraph URL in this order:

1. `SUBGRAPH_URL`
2. `NEXT_PUBLIC_SUBGRAPH_URL`
3. the hardcoded default in `src/lib/subgraph/client.ts`

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

No required Vercel environment variables for the main app under the current Studio-based setup.

If BlockETF later moves production querying to The Graph Gateway, the app should be updated to use a server-side API key flow instead of relying on the current default Studio URL.

## Subgraph Data Source

The V2 analytics views, position history, and transaction history read from the BlockETF V2 subgraph rather than from frontend mock data.

Current default deployment:

- Studio query URL: `https://api.studio.thegraph.com/query/1747541/blocketf-v2/2026-04-07-01`
- Studio page: `https://thegraph.com/studio/subgraph/blocketf-v2`

The transaction `Fee` column only applies to `Redeem` rows. Invest rows intentionally display `—`.

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
