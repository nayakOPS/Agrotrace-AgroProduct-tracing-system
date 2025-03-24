import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
// import { sepolia } from "thirdweb/chains";

 const client = createThirdwebClient({
  clientId: import.meta.env.VITE_PUBLIC_THIRDWEB_CLIENT_ID,
});

 const chain = defineChain(11155111);

// export const contract = getContract({
//     client,
//     chain,
//     address: "0x0247A74598e00Ec73F645fC64F4D4Aa4F6f9C117",
//   });

// Registration Contract
 const registrationContract = getContract({
  client,
  chain,
  address: "0x0247A74598e00Ec73F645fC64F4D4Aa4F6f9C117",
});

// ProductTraceability Contract
 const productTraceabilityContract = getContract({
  client,
  chain,
  address: "0x87C3E3c7D520C17AfE4Af0D4C1E14DB7c3D97Ae9",
});

export {
  client,
  chain,
  registrationContract,
  productTraceabilityContract,
};