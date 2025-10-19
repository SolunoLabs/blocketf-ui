// ETF Configuration

export const ETF_CONFIG = {
  name: "Crypto Top 5 Index",
  symbol: "CT5",
  description: "A diversified index of top 5 cryptocurrencies on BSC",

  // Fees in basis points (1 bp = 0.01%)
  fees: {
    withdrawFee: 10, // 0.1% (10 basis points)
    managementFee: 50, // 0.5% annual (50 basis points)
  },
} as const;

// ETF Asset Configuration
export interface ETFAsset {
  symbol: string;
  name: string;
  weight: number; // in basis points (10000 = 100%)
  decimals: number;
  icon?: string;
}

// Assets for BSC Testnet (5 assets)
export const TESTNET_ASSETS: ETFAsset[] = [
  {
    symbol: "WBNB",
    name: "Wrapped BNB",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "BTCB",
    name: "Bitcoin BEP2",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "ADA",
    name: "Cardano",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "BCH",
    name: "Bitcoin Cash",
    weight: 2000, // 20%
    decimals: 18,
  },
];

// Assets for BSC Mainnet (5 assets)
export const MAINNET_ASSETS: ETFAsset[] = [
  {
    symbol: "BTCB",
    name: "Bitcoin BEP2",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "ETH",
    name: "Ethereum Token",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "WBNB",
    name: "Wrapped BNB",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "XRP",
    name: "Binance-Peg XRP",
    weight: 2000, // 20%
    decimals: 18,
  },
  {
    symbol: "SOL",
    name: "Binance-Peg SOL",
    weight: 2000, // 20%
    decimals: 18,
  },
];

// Get assets based on chain ID
export function getETFAssets(chainId: number): ETFAsset[] {
  return chainId === 56 ? MAINNET_ASSETS : TESTNET_ASSETS;
}

// Helper to convert basis points to percentage
export function bpsToPercentage(bps: number): number {
  return bps / 100;
}

// Helper to format percentage
export function formatPercentage(bps: number): string {
  return `${bpsToPercentage(bps)}%`;
}

// Network configuration
export const NETWORK_CONFIG = {
  56: {
    name: "BSC Mainnet",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
  },
  97: {
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    blockExplorer: "https://testnet.bscscan.com",
    nativeCurrency: {
      name: "tBNB",
      symbol: "tBNB",
      decimals: 18,
    },
  },
} as const;

export type SupportedChainId = keyof typeof NETWORK_CONFIG;
