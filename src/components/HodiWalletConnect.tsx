import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';
import { useToast } from "./ui/use-toast";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap } from "lucide-react";
import { savePrincipalId, fetchAccount, updateWalletBalance } from "@/app/actions";

// HODI token mint address
const HODI_TOKEN_MINT = new PublicKey("HodiZE88VH3SvRYYX2fE6zYE6SsxPn9xJUMUkW1Dg6A");

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

// Create a reusable function to get a connection with proper error handling
const getSolanaConnection = () => {
  // Primary connection - use Helius RPC endpoint
  const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 
                      "https://rpc.helius.xyz/?api-key=81ecc4f5-fda6-4158-9a3f-b898e300d2e6";
  
  try {
    return new Connection(rpcEndpoint, "confirmed");
  } catch (error) {
    console.error("Error creating Solana connection:", error);
    // Fallback connection if primary fails
    return new Connection("https://api.mainnet-beta.solana.com", "confirmed");
  }
};

// Calculate points for a specific token balance
const calculateTierPoints = (balance: number) => {
  for (const tier of HODI_POINT_TIERS) {
    if (balance >= tier.min && balance <= tier.max) {
      return tier.points;
    }
  }
  return 0;
};

interface HodiWalletConnectProps {
  isDisabled: boolean;
  onWalletConnectSuccess: (points: number) => void;
}

const HodiWalletConnect: React.FC<HodiWalletConnectProps> = ({ isDisabled, onWalletConnectSuccess }) => {
  const { publicKey, connected } = useWallet();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tierPoints, setTierPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const initialLoadComplete = useRef(false);
  const storedPublicKey = useRef<PublicKey | null>(null);
  const lastCheckedBalance = useRef<number>(0);
  const connectionRetries = useRef(0);
  const lastPointUpdate = useRef<number>(Date.now());
  const MAX_RETRIES = 3;
  const MIN_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Function to get HODI token balance with retries
  const getTokenBalance = async (walletAddress: PublicKey): Promise<number> => {
    let retryCount = 0;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        console.log(`Getting balance for: ${walletAddress.toString()} (attempt ${retryCount + 1})`);
        
        // Get connection
        const connection = getSolanaConnection();
        
        // Get all token accounts for the user
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          walletAddress,
          { mint: HODI_TOKEN_MINT }
        );
        
        // Reset connection retries on success
        connectionRetries.current = 0;
        
        // If token accounts exist, get the balance
        if (tokenAccounts.value.length > 0) {
          const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          console.log("Found balance:", balance);
          return balance;
        }
        
        console.log("No token accounts found, returning 0");
        return 0;
      } catch (error) {
        retryCount++;
        connectionRetries.current++;
        
        // Log error details
        if (error instanceof Error) {
          console.error(`Error fetching token balance (attempt ${retryCount}):`, error.message);
          
          // If we got a 403 error, it's likely an RPC issue
          if (error.message.includes("403") || error.message.includes("forbidden")) {
            console.error("RPC access forbidden. Check your API key or RPC endpoint.");
          }
        } else {
          console.error(`Unknown error fetching token balance (attempt ${retryCount}):`, error);
        }
        
        if (retryCount <= MAX_RETRIES) {
          // Exponential backoff: wait longer between each retry
          const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
          console.log(`Retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        } else {
          console.error(`Failed to fetch token balance after ${MAX_RETRIES} retries.`);
          // Show toast notification about connection issues if we've had multiple failures
          if (connectionRetries.current >= MAX_RETRIES * 2) {
            toast({
              title: "Connection Issues",
              description: "Having trouble connecting to the Solana network. Please try again later.",
            });
            connectionRetries.current = 0; // Reset to avoid repeated notifications
          }
          return 0;
        }
      }
    }
    return 0;
  };

  // Update database with new balance and get incremental points if applicable
  const updateBalanceAndPoints = async (newBalance: number) => {
    if (!userId) return;
    
    // Check if there's a significant enough balance change to update
    const balanceChangePct = Math.abs((newBalance - lastCheckedBalance.current) / Math.max(lastCheckedBalance.current, 1));
    const timeElapsed = Date.now() - lastPointUpdate.current;
    
    // Only update if:
    // 1. Balance changed by at least 5% OR
    // 2. It's been at least MIN_UPDATE_INTERVAL since the last update
    if (balanceChangePct >= 0.05 || timeElapsed >= MIN_UPDATE_INTERVAL) {
      console.log("Updating balance in database:", newBalance);
      try {
        const result = await updateWalletBalance(userId, newBalance);
        
        if (result && result.success && result.pointsAwarded > 0) {
          // If we got new points, show a toast and update the local points state
          toast({
            title: "Points Awarded!",
            description: `You've earned ${result.pointsAwarded.toLocaleString()} points for increasing your HODI tokens!`,
          });
        }
        
        // Update our local tracking
        lastCheckedBalance.current = newBalance;
        lastPointUpdate.current = Date.now();
      } catch (error) {
        console.error("Error updating balance and points:", error);
      }
    }
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
        
        // Store the user ID for later use with updating points
        setUserId(account.id);
        
        // Set the last checked balance from the database
        if (account.last_token_balance) {
          lastCheckedBalance.current = parseFloat(account.last_token_balance);
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
            
            // Calculate and set tier points based on current balance, not total points
            const pointsForThisTier = calculateTierPoints(balance);
            setTierPoints(pointsForThisTier);
            
            setIsWalletConnected(true);
            initialLoadComplete.current = true;
            
            // Check if balance has changed and update points if needed
            if (balance !== lastCheckedBalance.current) {
              await updateBalanceAndPoints(balance);
            }
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
            
            // Calculate and set tier points based on current balance
            const pointsForThisTier = calculateTierPoints(balance);
            setTierPoints(pointsForThisTier);
            
            setIsWalletConnected(true);
            initialLoadComplete.current = true;
            
            // Check if balance has changed and update points if needed
            if (balance !== lastCheckedBalance.current) {
              await updateBalanceAndPoints(balance);
            }
            
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
            
            // For new connections, calculate the tier points
            const pointsForThisTier = calculateTierPoints(balance);
            setTokenBalance(balance);
            setTierPoints(pointsForThisTier);
            
            // Save wallet address and award points
            if (!account.principal_id) {
              console.log("Saving new principal ID and awarding points");
              const success = await savePrincipalId(publicKey.toString(), balance);
              
              if (cancelled) return;
              
              if (success) {
                setIsWalletConnected(true);
                initialLoadComplete.current = true;
                
                toast({
                  title: "Wallet Connected Successfully",
                  description: `Your wallet has ${balance.toLocaleString()} HODI tokens - awarded ${pointsForThisTier.toLocaleString()} points!`,
                });
                
                onWalletConnectSuccess(pointsForThisTier);
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
            
            // Update the UI with the new balance
            setTokenBalance(balance);
            
            // Calculate and set tier points based on current balance
            const pointsForThisTier = calculateTierPoints(balance);
            setTierPoints(pointsForThisTier);
            
            // Check for tier changes and update points in the database if needed
            if (balance !== lastCheckedBalance.current) {
              await updateBalanceAndPoints(balance);
            }
          } catch (error) {
            console.error("Error updating balance:", error);
          }
        };
        
        // Update balance right away and then periodically
        updateBalance();
        intervalId = setInterval(updateBalance, 60000); // Check every minute
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
        setTierPoints(0); // Reset tier points when disconnected
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
        <span className="font-bold text-xs sm:text-sm">{tierPoints.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default HodiWalletConnect;