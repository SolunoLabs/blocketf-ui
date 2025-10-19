// Contract addresses - will be updated after deployment
// TODO: Update these addresses after deploying to testnet/mainnet

export const contractAddresses = {
  // BSC Testnet addresses - Updated 2025-10-11 (Router v2)
  97: {
    // Core Contracts
    blockETFCore: "0xa63E59DEf7Ab22C17030467E75829C7F90f44d0C",
    priceOracle: "0xcF5d2d59810128fDE6d332827A0b1B01cb50245b",
    etfRouter: "0xa87f31e7c044260d466727607FF3Aed5c8330743",
    rebalancer: "0x797739bA3af7427066CeF9dbBC755e33082bF26E",
    quoterV3: "0x6a12F38238fC16e809F1eaBbe8E893812cC627f7",

    // USDT
    usdt: "0xe4e93c531697aeb44904f9579c3cce1034eb4886",

    // Faucets
    faucets: {
      usdt: "0x2bed84630e430f5bf1295b11a66266eae661aad8",
    },

    // Mock Tokens
    tokens: {
      usdt: "0xe4e93c531697aeb44904f9579c3cce1034eb4886",
      wbnb: "0x998367e7de460b309500e06cfdabb0c94adb18de",
      btcb: "0xd20268cb7065d20307b0793f702febddf5d24856",
      eth: "0xd81e1ac7f2ccdd106701e484f12b842684719bd3",
      ada: "0x8dcd14418995d376e40255dabf55ce58d994bfc4",
      bch: "0xe9636149f4ebda9e1d368385e39e74021d7bf53f",
    },

    // V3 Pools (Asset-USDT pairs)
    v3Pools: {
      wbnb: "0xAA2EeCccc51f1F2716Fc531E19eC83d3094f437c", // 0.01% fee
      btcb: "0x757fb48255e0470035a95a28fb9f3cec20a20e1f", // 0.05% fee
      eth: "0xab30c22eaf3aa69804b2eca3cccf2d1a2ff434bd", // 0.05% fee
      ada: "0x038df8c35068b9322780f38c61015a6d34e84fed", // 0.25% fee
      bch: "0xed441cca35f387cece32b9dc4a766e93f56f9f2b", // 0.25% fee
    },
  },
  // BSC Mainnet addresses - Updated 2025-10-14
  56: {
    // Core Contracts
    blockETFCore: "0xe186d78adD7218230661BE9311c801315d33Ae52",
    priceOracle: "0xa812b64eca5aEeaceDE86E7546b619d5CDB38E5b",
    etfRouter: "0xc6fBc345261de9239E188cCE4A2297eE3a5B251c",
    rebalancer: "0x9b746CEE616975969aF16CA74b53Fc33A5603127",

    // USDT
    usdt: "0x55d398326f99059fF775485246999027B3197955",

    // Real Tokens on BSC Mainnet
    tokens: {
      usdt: "0x55d398326f99059fF775485246999027B3197955",
      btcb: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      eth: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      xrp: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
      sol: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    },

    // V3 Pools (Asset-USDT pairs)
    v3Pools: {
      btcb: "0x46Cf1cF8c69595804ba91dFdd8d6b960c9B0a7C4", // 0.05% fee
      eth: "0xBe141893E4c6AD9272e8C04BAB7E6a10604501a5", // 0.05% fee
      wbnb: "0x172fcD41E0913e95784454622d1c3724f546f849", // 0.01% fee
      xrp: "0x71f5a8F7d448E59B1ede00A19fE59e05d125E742", // 0.25% fee
      sol: "0x9F5a0AD81Fe7fD5dFb84EE7A0CFb83967359BD90", // 0.25% fee
    },

    // DEX Infrastructure
    dex: {
      pancakeV3Router: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
      pancakeV3Quoter: "0xd07FdFd5918eEd466Cd9Ed86d2Fef6C578BFC787",
      pancakeV2Router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    },
  },
} as const;

export type SupportedChainId = keyof typeof contractAddresses;

export function getContractAddress(
  chainId: SupportedChainId,
  contract: keyof (typeof contractAddresses)[SupportedChainId]
): `0x${string}` {
  return contractAddresses[chainId][contract] as `0x${string}`;
}
