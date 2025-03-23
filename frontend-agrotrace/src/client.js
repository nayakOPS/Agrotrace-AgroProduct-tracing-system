import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_PUBLIC_THIRDWEB_CLIENT_ID,
});

export const chain = defineChain(11155111);

export const contract = getContract({
    client,
    chain,
    address: "0x0247A74598e00Ec73F645fC64F4D4Aa4F6f9C117",
  });