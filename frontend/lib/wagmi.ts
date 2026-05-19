import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

export const mezoTestnet = defineChain({
  id: 31611,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.test.mezo.org"] },
  },
  blockExplorers: {
    default: { name: "Mezo Explorer", url: "https://explorer.test.mezo.org" },
  },
});

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

const connectors = projectId
  ? [injected(), walletConnect({ projectId, showQrModal: true })]
  : [injected()];

export const wagmiConfig = createConfig({
  chains: [mezoTestnet],
  connectors,
  transports: {
    [mezoTestnet.id]: http(),
  },
});
