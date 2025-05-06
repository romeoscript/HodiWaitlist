import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';
import { useToast } from "./ui/use-toast";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Zap } from "lucide-react";
import { savePrincipalId } from "@/app/actions";

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

  // Function to get HODI token balance
  const getTokenBalance = async (walletAddress) => {
    try {
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
        return balance;
      }
      
      return 0;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return 0;
    }
  };
  
  // Calculate points based on token balance
  const calculatePoints = (balance) => {
    for (const tier of HODI_POINT_TIERS) {
      if (balance >= tier.min && balance <= tier.max) {
        return tier.points;
      }
    }
    return 0;
  };

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && publicKey && !isWalletConnected) {
        setIsLoading(true);
        
        try {
          // Get token balance
          const balance = await getTokenBalance(publicKey);
          setTokenBalance(balance);
          
          // Calculate points based on balance
          const points = calculatePoints(balance);
          setAwardedPoints(points);
          
          // Save wallet connection and awarded points to backend
          const success = await savePrincipalId(publicKey.toString(), points);
          
          if (success) {
            setIsWalletConnected(true);
            
            toast({
              title: "Wallet Connected Successfully",
              description: `Your wallet has $${balance.toLocaleString()} HODI tokens - awarded ${points.toLocaleString()} points!`,
            });
            
            // Callback to parent component
            onWalletConnectSuccess(points);
          }
        } catch (error) {
          console.error("Wallet connection error:", error);
          toast({
            title: "Error",
            description: "Failed to connect your wallet and check token balance.",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (!connected) {
        setIsWalletConnected(false);
        setTokenBalance(0);
        setAwardedPoints(0);
      }
    };

    handleWalletConnection();
  }, [connected, publicKey, onWalletConnectSuccess, toast]);

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