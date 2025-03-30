import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { client, chain } from '../../client';
import { motion } from 'framer-motion';

const WalletInfo = () => {
  const account = useActiveAccount();
  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain,
    address: account?.address,
  });

  if (!account) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-md p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Wallet Not Connected</h3>
          <p className="text-gray-500">Please connect your wallet to view balance and details</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[300px] bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-md overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-2xl font-bold text-emerald-800 mb-6">Wallet Information</h2>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Address</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <div>
                <p className="font-mono text-sm text-gray-600 break-all">
                  {account.address}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Balance</h3>
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {balance?.displayValue} <span className="text-lg font-medium text-gray-600">{balance?.symbol}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Network</h3>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                </svg>
              </div>
              <div>
                <p className="text-gray-800 font-medium">{chain.name}</p>
                <p className="text-sm text-gray-500">Chain ID: {chain.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletInfo;