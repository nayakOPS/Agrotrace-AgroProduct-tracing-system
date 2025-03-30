import { useActiveAccount } from 'thirdweb/react';
import { useReadContract } from 'thirdweb/react';
import { registrationContract } from '../client';

export const useRole = () => {
  const account = useActiveAccount();
  const { data: role, isLoading } = useReadContract({
    contract: registrationContract,
    method: "function getRole(address _wallet) view returns (string)",
    params: [account?.address || ""],
  });

  return {
    role,
    isLoading,
    isFarmer: role === 'Farmer',
    isTrader: role === 'AgroTrader',
    isAuthenticated: !!account,
    account
  };
};