import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';
import { useToast } from "./ui/use-toast";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap } from "lucide-react";
import { savePrincipalId, fetchAccount } from "@/app/actions";

// HODI token mint address (replace with the actual mint address)
const HODI_TOKEN_MINT = new PublicKey("GHT5rrrAh5PxAxfP7vB3VnjPxeoxnVVDBVVQrgaVvbQ4");

// Define point structure based on token amounts
const HODI_POINT_TIERS = [
  { min: 0, max: 24999, points: 0 },
  { min: 25000, max: 74999, points: 750 },
  { min: 75000, max: 249999, points: 2000 },
  { min: 250000, max: 499999, points: 5000 },
  { min: 500000, max: 1249999, points: 10000 },
  { min: 1250000, max: 2499999, points: 20000 },
  { min: 2500000, max: Infinity, points: 50000 }
];

const HodiWalletConnect = ({ isDisabled, onWalletConnectSuccess }) => {
  const { publicKey, connected } = useWallet();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [awardedPoints, setAwardedPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const initialLoadComplete = useRef(false);
  const storedPublicKey = useRef(null);

  // Function to get HODI token balance
  const getTokenBalance = async (walletAddress) => {
    try {
      console.log("Getting balance for:", walletAddress.toString());
      // Connect to Solana blockchain
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com",
        "confirmed"
      );
      
      // Get all token accounts for the user
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletAddress,
        { mint: HODI_TOKEN_MINT }
      );
      
      // If token accounts exist, get the balance
      if (tokenAccounts.value.length > 0) {
        const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        console.log("Found balance:", balance);
        return balance;
      }
      
      console.log("No token accounts found, returning 0");
      return 0;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return 0;
    }
  };
  
  // Calculate points based on token balance
  const calculatePoints = (balance: any) => {
    for (const tier of HODI_POINT_TIERS) {
      if (balance >= tier.min && balance <= tier.max) {
        return tier.points;
      }
    }
    return 0;
  };

  // Single combined effect to handle wallet data loading, connection and updates
  useEffect(() => {
    let cancelled = false;
    let intervalId: NodeJS.Timeout | null = null;
    
    const loadWalletData = async () => {
      if (cancelled) return;
      
      try {
        setIsLoading(true);
        const account = await fetchAccount();
        console.log("Fetched account:", account);
        
        if (!account) {
          console.log("No account found");
          setIsLoading(false);
          return;
        }
        
        // Handle already connected wallet from database
        if (account.principal_id && !connected) {
          console.log("Account has principal_id but wallet not connected in UI:", account.principal_id);
          try {
            const walletPublicKey = new PublicKey(account.principal_id);
            storedPublicKey.current = walletPublicKey;
            
            if (cancelled) return;
            
            const balance = await getTokenBalance(walletPublicKey);
            console.log("Initial balance from stored wallet:", balance);
            
            if (cancelled) return;
            
            setTokenBalance(balance);
            setAwardedPoints(calculatePoints(balance));
            setIsWalletConnected(true);
            initialLoadComplete.current = true;
          } catch (error) {
            console.error("Error processing stored wallet:", error);
          } finally {
            if (!cancelled) setIsLoading(false);
          }
          return;
        }
        
        // Handle case where wallet is connected in UI
        if (connected && publicKey) {
          console.log("Wallet connected in UI:", publicKey.toString());
          
          // Check if this wallet is already associated with account
          if (account.principal_id === publicKey.toString()) {
            console.log("Wallet already associated with account");
            
            if (cancelled) return;
            
            const balance = await getTokenBalance(publicKey);
            console.log("Balance for connected wallet:", balance);
            
            if (cancelled) return;
            
            setTokenBalance(balance);
            setAwardedPoints(calculatePoints(balance));
            setIsWalletConnected(true);
            initialLoadComplete.current = true;
            
            if (!cancelled) setIsLoading(false);
            return;
          }
          
          // Handle new wallet connection
          if (!isWalletConnected && !initialLoadComplete.current) {
            console.log("New wallet connection, getting balance");
            
            if (cancelled) return;
            
            const balance = await getTokenBalance(publicKey);
            console.log("Balance for new wallet:", balance);
            
            if (cancelled) return;
            
            const points = calculatePoints(balance);
            setTokenBalance(balance);
            setAwardedPoints(points);
            
            // Save wallet address and award points
            if (!account.principal_id) {
              console.log("Saving new principal ID and awarding points");
              const success = await savePrincipalId(publicKey.toString(), points);
              
              if (cancelled) return;
              
              if (success) {
                setIsWalletConnected(true);
                initialLoadComplete.current = true;
                
                toast({
                  title: "Wallet Connected Successfully",
                  description: `Your wallet has ${balance.toLocaleString()} HODI tokens - awarded ${points.toLocaleString()} points!`,
                });
                
                onWalletConnectSuccess(points);
              }
            } else {
              // Wallet already exists but different from current connection
              setIsWalletConnected(true);
              initialLoadComplete.current = true;
              onWalletConnectSuccess(0);
            }
          }
        }
      } catch (error) {
        console.error("Error in loadWalletData:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    
    // Function to periodically update balance
    const setupBalanceUpdates = () => {
      if ((connected && publicKey && isWalletConnected) || 
          (isWalletConnected && storedPublicKey.current)) {
        
        const updateBalance = async () => {
          if (cancelled) return;
          
          try {
            const walletToCheck = publicKey || storedPublicKey.current;
            if (!walletToCheck) return;
            
            const balance = await getTokenBalance(walletToCheck);
            console.log("Periodic balance update:", balance);
            
            if (cancelled) return;
            
            setTokenBalance(balance);
            setAwardedPoints(calculatePoints(balance));
          } catch (error) {
            console.error("Error updating balance:", error);
          }
        };
        
        // Update balance right away and then periodically
        updateBalance();
        intervalId = setInterval(updateBalance, 60000);
      }
    };
    
    // Main execution flow
    const initialize = async () => {
      await loadWalletData();
      if (!cancelled) setupBalanceUpdates();
    };
    
    initialize();
    
    // Cleanup function
    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [connected, publicKey, onWalletConnectSuccess, toast]);
  
  // Handle disconnection
  useEffect(() => {
    if (!connected && initialLoadComplete.current) {
      // Only reset UI state, not the database connection
      // This allows showing balance even when wallet UI is disconnected
      if (storedPublicKey.current) {
        console.log("Wallet disconnected in UI but we have stored wallet");
      } else {
        console.log("Wallet fully disconnected");
        setIsWalletConnected(false);
        setTokenBalance(0);
        setAwardedPoints(0);
      }
    }
  }, [connected]);

  return (
    <div className="flex items-center">
      <div className={`min-w-[28px] h-7 sm:min-w-[32px] sm:h-8 flex items-center justify-center rounded-full ${isWalletConnected ? 'bg-yellow-400' : 'bg-gray-800'} mr-2 sm:mr-4`}>
        {isWalletConnected ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/50" />
          </motion.div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <WalletMultiButton
          className="wallet-adapter-button wallet-adapter-button-trigger"
          style={{
            backgroundColor: isWalletConnected ? "#d4af37" : "#eab308",
            color: "black",
            fontFamily: "inherit",
            height: "36px",
            padding: "0 12px",
            fontSize: "12px",
            borderRadius: "8px",
            cursor: isDisabled || isWalletConnected ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            transition: "background-color 0.2s ease",
            opacity: isDisabled || isWalletConnected ? 0.7 : 1,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
          disabled={isDisabled || isWalletConnected || isLoading}
        >
          {isLoading ? "Checking HODI Balance..." : 
           isWalletConnected ? `${tokenBalance.toLocaleString()} HODI Detected` : 
           "Connect HODI Wallet"}
        </WalletMultiButton>
      </div>
      
      <div className="ml-2 sm:ml-4 flex items-center text-yellow-400 whitespace-nowrap">
        <Zap size={14} className="mr-1 sm:h-4 sm:w-4" />
        <span className="font-bold text-xs sm:text-sm">{awardedPoints.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default HodiWalletConnect;