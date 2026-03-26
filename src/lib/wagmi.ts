import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bsc } from "wagmi/chains";
import { http } from "wagmi";

const WALLETCONNECT_PROJECT_ID = "5bcab6910e97268ba85ad2a27528f8b8";

export const config = getDefaultConfig({
  appName: "BlockETF",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [bsc],
  transports: {
    [bsc.id]: http('https://bnb-mainnet.g.alchemy.com/v2/4ioaB6YdGZFYZsWlfj1PJ-TimQ0dS5RP'),
  },
});
