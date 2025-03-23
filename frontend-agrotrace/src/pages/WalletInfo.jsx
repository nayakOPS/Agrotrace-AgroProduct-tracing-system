import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { client, chain } from '../client';

export default function WalletInfo() {
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });

  return (
    <div>
      <p>Wallet address: {account.address || "Please Connect to a Wallet"}</p>
      <p>
        Wallet balance: {isLoading ? "Loading..." : balance?.displayValue + " " + balance?.symbol}
      </p>
    </div>
  );
}
