// Contract ABIs - simplified versions with only the functions we need

export const blockETFCoreABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAssets',
    outputs: [
      {
        components: [
          { name: 'token', type: 'address' },
          { name: 'weight', type: 'uint32' },
          { name: 'reserve', type: 'uint224' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getShareValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isPaused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFeeInfo',
    outputs: [
      {
        components: [
          { name: 'withdrawFee', type: 'uint32' },
          { name: 'managementFeeRate', type: 'uint128' },
          { name: 'accumulatedFee', type: 'uint256' },
          { name: 'lastCollectTime', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const blockETFV2FactoryABI = [
  {
    inputs: [],
    name: 'getAllETFs',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'isETF',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'etfLevel',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const blockETFV2CoreABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAssets',
    outputs: [
      {
        components: [
          { name: 'token', type: 'address' },
          { name: 'vToken', type: 'address' },
          { name: 'weight', type: 'uint32' },
          { name: 'reserve', type: 'uint224' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getRebalanceInfo',
    outputs: [
      { name: 'currentWeights', type: 'uint256[]' },
      { name: 'targetWeights', type: 'uint256[]' },
      { name: 'needsRebalance', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getShareValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFeeInfo',
    outputs: [
      {
        components: [
          { name: 'withdrawFee', type: 'uint32' },
          { name: 'managementFeeRate', type: 'uint128' },
          { name: 'accumulatedFee', type: 'uint256' },
          { name: 'lastCollectTime', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAnnualManagementFee',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isPaused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'priceOracle',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const blockETFV2LensABI = [
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'getAssets',
    outputs: [
      {
        components: [
          { name: 'token', type: 'address' },
          { name: 'vToken', type: 'address' },
          { name: 'weight', type: 'uint32' },
          { name: 'reserve', type: 'uint224' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'getRebalanceInfo',
    outputs: [
      { name: 'currentWeights', type: 'uint256[]' },
      { name: 'targetWeights', type: 'uint256[]' },
      { name: 'needsRebalance', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'getTotalValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'getShareValue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'getFeeInfo',
    outputs: [
      {
        components: [
          { name: 'withdrawFee', type: 'uint32' },
          { name: 'managementFeeRate', type: 'uint128' },
          { name: 'accumulatedFee', type: 'uint256' },
          { name: 'lastCollectTime', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'getAnnualManagementFee',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'isPaused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const blockETFV2RouterABI = [
  {
    inputs: [
      { name: 'etf', type: 'address' },
      { name: 'usdtAmount', type: 'uint256' },
      { name: 'minShares', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'mintWithUSDT',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'etf', type: 'address' },
      { name: 'shares', type: 'uint256' },
      { name: 'maxUSDT', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'mintExactShares',
    outputs: [{ name: 'usdtUsed', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'etf', type: 'address' },
      { name: 'shares', type: 'uint256' },
      { name: 'minUSDT', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'burnToUSDT',
    outputs: [{ name: 'usdtAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'etf', type: 'address' },
      { name: 'shares', type: 'uint256' },
    ],
    name: 'usdtNeededForShares',
    outputs: [{ name: 'usdtAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'etf', type: 'address' },
      { name: 'usdtAmount', type: 'uint256' },
    ],
    name: 'usdtToShares',
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'etf', type: 'address' },
      { name: 'shares', type: 'uint256' },
    ],
    name: 'sharesToUsdt',
    outputs: [{ name: 'usdtAmount', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const blockETFV2RebalancerABI = [
  {
    inputs: [{ name: 'etf', type: 'address' }],
    name: 'executeRebalance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const priceOracleABI = [
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokens', type: 'address[]' }],
    name: 'getPrices',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const vTokenABI = [
  {
    inputs: [],
    name: 'exchangeRateStored',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const etfRouterABI = [
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'maxUSDT', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'mintExactShares',
    outputs: [{ name: 'usdtUsed', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'minUSDT', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
    name: 'burnToUSDT',
    outputs: [{ name: 'usdtAmount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'usdtNeededForShares',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'shares', type: 'uint256' }],
    name: 'sharesToUsdt',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'usdtAmount', type: 'uint256' }],
    name: 'usdtToShares',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const erc20ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
