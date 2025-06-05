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
  // address: "0x0247A74598e00Ec73F645fC64F4D4Aa4F6f9C117",
  address: "0x00ADcFA0b925306678C002Aba379D89E2eA80800", 
});

// ProductTraceability Contract
 const productTraceabilityContract = getContract({
  client,
  chain,
  // address: "0x87C3E3c7D520C17AfE4Af0D4C1E14DB7c3D97Ae9", 
  // address: "0x4315bC1e41BC7b24bEF1BAaC8D5064ffFa48b21d", 2nd old
  address: "0xB06560eCf057023c2fE7018FAdE8eC37AfCc2D28", // new
});

export {
  client,
  chain,
  registrationContract,
  productTraceabilityContract,
};