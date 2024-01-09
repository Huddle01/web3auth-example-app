import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";

if (!process.env.NEXT_PUBLIC_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_CLIENT_ID is not set");
}

export const web3auth = new Web3Auth({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK.MAINNET,
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: "https://rpc.ankr.com/eth",
  },
});
