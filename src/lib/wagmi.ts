import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { bsc } from "wagmi/chains";
import { http } from "wagmi";

const WALLETCONNECT_PROJECT_ID = "5bcab6910e97268ba85ad2a27528f8b8";

export const config = getDefaultConfig({
  appName: "BlockETF",
  projectId: WALLETCONNECT_PROJECT_ID,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        okxWallet,
        injectedWallet,
        walletConnectWallet,
      ],
    },
  ],
  chains: [bsc],
  multiInjectedProviderDiscovery: false,
  transports: {
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
  },
  ssr: true,
});
