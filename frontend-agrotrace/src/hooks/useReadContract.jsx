import { client } from "./client";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";

const contract = getContract({
  client,
  address: "0x...",
  chain: sepolia,
});

export default function App() {
  const { data, isLoading } = useReadContract({
    contract,
    method: "function tokenURI(uint256 tokenId) returns (string)",
    params: [1n],
  });

  return (
    <div>
      <p>Token URI: {data}</p>
    </div>
  );
}
