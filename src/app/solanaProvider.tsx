'use client'
import React, { ReactNode, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    ConnectionProvider,
    WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Get network from environment or default to mainnet
const SOLANA_NETWORK = 
  process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet'
    ? WalletAdapterNetwork.Devnet
    : process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'testnet'
    ? WalletAdapterNetwork.Testnet
    : WalletAdapterNetwork.Mainnet;

// Custom RPC URL if specified in environment
const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;

interface SolanaProviderProps {
    children: ReactNode;
}

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
    // Use custom endpoint or default based on network
    const endpoint = SOLANA_RPC_ENDPOINT || clusterApiUrl(SOLANA_NETWORK);
    
    // Initialize wallet adapters
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network: SOLANA_NETWORK }),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        new CoinbaseWalletAdapter(),
 
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default SolanaProvider;