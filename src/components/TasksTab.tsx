'use client'
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Clipboard, ChevronDown, ChevronUp, Star, Lock, Zap, Trophy, Award, DollarSign, UserPlus, Gift, CheckCircle2 } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import HodiWalletConnect from "./HodiWalletConnect";
import Image from "next/image";
import { useToast } from "./ui/use-toast";
import {
  fetchAccount,
  fetchPointsList,
  fetchTwitterFollowed,
  fetchTwitterIIFollowed,
  fetchTwitterIIIFollowed,
  fetchDiscordJoined,
  fetchTelegramJoined,
  fetchTelegramIIJoined,
} from "@/app/actions";
import { savePrincipalId } from "@/app/actions";
import {
  TwitterButton,
  TwitterIIButton,
  TwitterIIIButton,
} from "./ui/twitterButton";
import DiscordButton from "./ui/discordButton";
import { TelegramButton, TelegramIIButton } from "./ui/telegramButton";
import { generateShareText } from "@/utils/share/share";
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from "framer-motion";

const COPY_BTN_TEXT = "Copy";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

interface UserData {
  invitation_code: string;
  points: number;
  level: number;
  total_points: number;
  invited_accounts_count: number;
  // Add other user data properties as needed
}

interface Point {
  amount: number;
  note: string;
  created_at: string;
}

interface PointsList extends Array<Point> { }

export default function TasksTab() {
  const [buttonText, setButtonText] = useState(COPY_BTN_TEXT);
  const [isTwitterFollowed, setIsTwitterFollowed] = useState(false);
  const [isTwitterIIFollowed, setIsTwitterIIFollowed] = useState(false);
  const [isTwitterIIIFollowed, setIsTwitterIIIFollowed] = useState(false);
  const [isDiscordJoined, setIsDiscordJoined] = useState(false);
  const [isTelegramJoined, setIsTelegramJoined] = useState(false);
  const [isTelegramIIJoined, setIsTelegramIIJoined] = useState(false);
  const [isSolanaWalletConnected, setIsSolanaWalletConnected] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pointsList, setPointsList] = useState<PointsList | null>(null);
  const [userPointsTotal, setUserPointsTotal] = useState(0);
  const { toast } = useToast();
  const { publicKey, connected, disconnect } = useWallet();
  const [activeTab, setActiveTab] = useState('tasks');
  const [isRewardDetailOpen, setIsRewardDetailOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Copy to clipboard with gamified feedback
  const copyToClipboard = async () => {
    const link = document.getElementById("link-input") as HTMLInputElement;
    if (link) {
      await navigator.clipboard.writeText(link.value);
      setButtonText("Copied!");
      // Show success animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      toast({
        title: "Link Copied!",
        description: "Your NFT waitlist referral link is ready to share!",
      });

      setTimeout(() => setButtonText(COPY_BTN_TEXT), 3000);
    }
  };

  const refreshTwitterFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterFollowed();
      const wasAlreadyFollowed = isTwitterFollowed;
      setIsTwitterFollowed(!!followed);

      if (!wasAlreadyFollowed && followed) {
        triggerRewardAnimation("Twitter follow completed! +100 points");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTwitterIIFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterIIFollowed();
      const wasAlreadyFollowed = isTwitterIIFollowed;
      setIsTwitterIIFollowed(!!followed);

      if (!wasAlreadyFollowed && followed) {
        triggerRewardAnimation("$HODI Twitter follow completed! +100 points");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTwitterIIIFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterIIIFollowed();
      const wasAlreadyFollowed = isTwitterIIIFollowed;
      setIsTwitterIIIFollowed(!!followed);

      if (!wasAlreadyFollowed && followed) {
        triggerRewardAnimation("Cat Cartel follow completed! +100 points");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDiscordJoinStatus = async () => {
    setIsLoading(true);
    try {
      const joined = await fetchDiscordJoined();
      const wasAlreadyJoined = isDiscordJoined;
      setIsDiscordJoined(!!joined);

      if (!wasAlreadyJoined && joined) {
        triggerRewardAnimation("Discord join completed! +100 points");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTelegramJoinStatus = async () => {
    setIsLoading(true);
    try {
      const joined = await fetchTelegramJoined();
      const wasAlreadyJoined = isTelegramJoined;
      setIsTelegramJoined(!!joined);

      if (!wasAlreadyJoined && joined) {
        triggerRewardAnimation("Telegram join completed! +100 points");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTelegramFollowStatus = async () => {
    setIsLoading(true);
    try {
      const joined = await fetchTelegramIIJoined();
      const wasAlreadyJoined = isTelegramIIJoined;
      setIsTelegramIIJoined(!!joined);

      if (!wasAlreadyJoined && joined) {
        triggerRewardAnimation("Telegram channel join completed! +100 points");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gamified reward animation
  const [rewardMessage, setRewardMessage] = useState("");
  const [showReward, setShowReward] = useState(false);

  const triggerRewardAnimation = (message: string) => {
    setRewardMessage(message);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 3000);
  };

  // Handle Solana wallet connection
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && publicKey) {
        setIsLoading(true);
        try {
          const success = await savePrincipalId(publicKey.toString());
          if (success) {
            const wasAlreadyConnected = isSolanaWalletConnected;
            setIsSolanaWalletConnected(true);

            if (!wasAlreadyConnected) {
              triggerRewardAnimation("Wallet connected! +200 points");
              toast({
                title: "Wallet Connected",
                description: "Your Solana wallet has been successfully connected 🔥",
              });
            }
          }
        } catch (error) {
          console.error("Solana Wallet connection error:", error);
          toast({
            title: "Error",
            description: "Failed to connect your Solana wallet.",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsSolanaWalletConnected(false);
      }
    };

    handleWalletConnection();
  }, [connected, publicKey, toast]);

  // Setup the share text
  const shareText = `Just joined the NFT waitlist 🎨

• Limited collection with real utility
• Backed by a strong community
• Early access to mint
• Exclusive NFT rewards

Join me on the waitlist & earn points with my referral link:
https://nft.xyz/?ref=${userData?.invitation_code}`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(url, "_blank");
    toast({
      title: "Sharing on Twitter",
      description: "Thanks for spreading the word!",
    });
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      "nft.xyz"
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
    toast({
      title: "Sharing on Telegram",
      description: "Thanks for spreading the word!",
    });
  };

  useEffect(() => {
    setIsLoading(true);

    const loadData = async () => {
      let total = 0;
      try {
        const fetchUser = await fetchAccount();
        const fetchedPointsList = await fetchPointsList();

        setPointsList(fetchedPointsList);
        setUserData(fetchUser);

        if (fetchedPointsList) {
          setIsTwitterFollowed(
            fetchedPointsList.some(
              (point) => point.note === "Follow $HODI on Twitter"
            ) || false
          );

          setIsTwitterIIFollowed(
            fetchedPointsList.some(
              (point) => point.note === "Follow Cat Cartel on Twitter"
            ) || false
          );

          setIsTwitterIIIFollowed(
            fetchedPointsList.some(
              (point) => point.note === "Follow Cat Cartel on Twitter"
            ) || false
          );

          setIsDiscordJoined(
            fetchedPointsList.some(
              (point) => point.note === "Joined Discord Cat Cartel"
            ) || false
          );

          setIsTelegramJoined(
            fetchedPointsList.some(
              (point) => point.note === "Joined Telegram Community"
            ) || false
          );

          setIsTelegramIIJoined(
            fetchedPointsList.some(
              (point) => point.note === "Joined Telegram Channel"
            ) || false
          );

          fetchedPointsList.forEach((p) => {
            total += p.amount;
          });
        }

        setIsSolanaWalletConnected(fetchUser?.principal_id ? true : false);
        setUserPointsTotal(total);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data. Please try again.",
        });
      }
    };

    loadData().finally(() => {
      setIsLoading(false);
    });

  }, [isSolanaWalletConnected, isTwitterFollowed, toast]);

  const calculateProgress = () => {
    if (!userData) return 0;

    if (userData.total_points < 5000) {
      return (userData.total_points / 5000) * 100;
    } else if (userData.total_points < 20000) {
      return ((userData.total_points - 5000) / 15000) * 100;
    } else if (userData.total_points < 50000) {
      return ((userData.total_points - 20000) / 30000) * 100;
    }
    return 100;
  };

  const getCurrentLevel = () => {
    if (!userData) return 0;

    if (userData.total_points < 5000) {
      return 0;
    } else if (userData.total_points < 20000) {
      return 1;
    } else if (userData.total_points < 50000) {
      return 2;
    }
    return 3;
  };

  const getNextLevelTarget = () => {
    if (!userData) return 5000;

    if (userData.total_points < 5000) {
      return 5000;
    } else if (userData.total_points < 20000) {
      return 20000;
    } else if (userData.total_points < 50000) {
      return 50000;
    }
    return null;
  };

  const getPointsToNextLevel = () => {
    const nextLevel = getNextLevelTarget();
    if (!nextLevel || !userData) return 0;
    return nextLevel - userData.total_points;
  };

  const getLevelName = (level: number): string => {
    switch (level) {
      case 1: return "Street Cat";
      case 2: return "Capo";
      case 3: return "Big Boss ";
      default: return "Rookie";
    }
  };

  // Special animations for loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-yellow-400"
        >
          Loading your $HODI data...
        </motion.div>
        <motion.div
          animate={{
            rotate: 360,
            borderRadius: ["20%", "50%", "20%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="h-20 w-20 sm:h-32 sm:w-32 border-b-4 border-t-4 border-yellow-400"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Reward animation overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-16 sm:top-24 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-yellow-400 text-black px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg flex items-center">
              <Trophy className="mr-2 animate-pulse h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-bold text-sm sm:text-base">{rewardMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti animation for referral copy */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-40"
          >
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    top: "0%",
                    left: `${Math.random() * 100}%`,
                    scale: 0.5,
                    opacity: 1
                  }}
                  animate={{
                    top: "100%",
                    scale: 1,
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    ease: "easeOut",
                    delay: Math.random() * 0.5
                  }}
                  className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                  style={{
                    background: i % 2 === 0 ? "#FFD700" : "#000000",
                    boxShadow: "0 0 10px rgba(255, 215, 0, 0.7)"
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-2 border-yellow-400 bg-black text-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-400 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-xl sm:text-3xl font-bold text-black">
                  NFT Waitlist
                </CardTitle>
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CardDescription className="text-black/80 mt-1 sm:mt-2 text-sm sm:text-lg">
                  Complete tasks, earn points, level up!
                </CardDescription>
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.5
              }}
              className="flex items-center"
            >
              <div className="bg-black/30 p-2 sm:p-3 rounded-full text-white text-base sm:text-xl font-bold">
                {userPointsTotal}
                <span className="ml-1 text-yellow-300">⚡</span>
              </div>
            </motion.div>
          </div>
        </CardHeader>

        {/* Tabs navigation - Mobile Friendly */}
        <div className="bg-black border-b border-yellow-400/30">
          <div className="flex">
            <motion.button
              whileHover={{ backgroundColor: activeTab === 'tasks' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm ${activeTab === 'tasks' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-white/70'
                }`}
              onClick={() => setActiveTab('tasks')}
            >
              <div className="flex items-center justify-center">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Tasks</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: activeTab === 'rewards' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm ${activeTab === 'rewards' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-white/70'
                }`}
              onClick={() => setActiveTab('rewards')}
            >
              <div className="flex items-center justify-center">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Rewards</span>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: activeTab === 'points' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 text-center font-medium text-xs sm:text-sm ${activeTab === 'points' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-white/70'
                }`}
              onClick={() => setActiveTab('points')}
            >
              <div className="flex items-center justify-center">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Points</span>
              </div>
            </motion.button>
          </div>
        </div>

        <CardContent className="p-0">
          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="p-3 sm:p-6">
              {/* Level progress section */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-5 sm:mb-8 bg-gray-900 p-3 sm:p-6 rounded-xl border border-yellow-400/30"
              >
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-yellow-400/30 animate-ping opacity-30"></div>
                      <div className="relative bg-yellow-400/20 rounded-full p-1 sm:p-2">
                        <Trophy className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Level {getCurrentLevel()}: <span className="text-yellow-400">{getLevelName(getCurrentLevel())}</span>
                      </h3>
                      <p className="text-xs text-white/60">
                        {getNextLevelTarget() ? `${getPointsToNextLevel()} points to next level` : "Maximum level reached!"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black py-1 px-2 sm:px-3 rounded-full text-white font-bold border border-yellow-400/30 text-center text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0">
                    {userPointsTotal} <span className="text-yellow-400">points</span>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-3 sm:mt-4 mb-2">
                  <div className="w-full h-2 sm:h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300"
                    />
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mt-4 sm:mt-6 grid grid-cols-3 gap-1 sm:gap-2 text-center"
                >
                  <div
                    className={`p-1 sm:p-2 rounded-lg relative overflow-hidden ${getCurrentLevel() >= 1
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-300 text-black'
                        : 'bg-gray-800 text-white/50 border border-yellow-400/20'
                      }`}
                  >
                    {getCurrentLevel() >= 1 && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute top-0 right-0 sm:top-1 sm:right-1"
                      >
                        <div className="bg-black rounded-full p-0.5 sm:p-1">
                          <Star className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-400" />
                        </div>
                      </motion.div>
                    )}
                    <div className="font-bold text-xs sm:text-sm">Street Cat</div>
                    <div className="text-[10px] sm:text-xs">5,000 pts</div>
                  </div>
                  <div
                    className={`p-1 sm:p-2 rounded-lg relative overflow-hidden ${getCurrentLevel() >= 2
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-300 text-black'
                        : 'bg-gray-800 text-white/50 border border-yellow-400/20'
                      }`}
                  >
                    {getCurrentLevel() >= 2 && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="absolute top-0 right-0 sm:top-1 sm:right-1"
                      >
                        <div className="bg-black rounded-full p-0.5 sm:p-1">
                          <Star className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-400" />
                        </div>
                      </motion.div>
                    )}
                    <div className="font-bold text-xs sm:text-sm">Capo</div>
                    <div className="text-[10px] sm:text-xs">20,000 pts</div>
                  </div>
                  <div
                    className={`p-1 sm:p-2 rounded-lg relative overflow-hidden ${getCurrentLevel() >= 3
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-300 text-black'
                        : 'bg-gray-800 text-white/50 border border-yellow-400/20'
                      }`}
                  >
                    {getCurrentLevel() >= 3 && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="absolute top-0 right-0 sm:top-1 sm:right-1"
                      >
                        <div className="bg-black rounded-full p-0.5 sm:p-1">
                          <Star className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-400" />
                        </div>
                      </motion.div>
                    )}
                    <div className="font-bold text-xs sm:text-sm">Big Boss </div>
                    <div className="text-[10px] sm:text-xs">50,000 pts</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Referral section */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-5 sm:mb-8 bg-gradient-to-b from-gray-900 to-black p-3 sm:p-6 rounded-xl border border-yellow-400/30"
              >
                <motion.div variants={itemVariants} className="flex gap-4 flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center">
                      <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-1 sm:mr-2" />
                      <h3 className="text-base sm:text-lg font-bold text-white">Invite Friends</h3>
                    </div>
                    <p className="text-white/70 text-xs sm:text-sm mt-1">
                      <span className="text-yellow-400 font-bold">500 points</span> for each referral + <span className="text-yellow-400 font-bold">10%</span> of their earnings!
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#1a91da" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareOnTwitter}
                      className="bg-[#1DA1F2] text-white py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    >
                      <Image
                        src="/images/twitter.png"
                        alt="twitter"
                        width={14}
                        height={14}
                        className="sm:w-4 sm:h-4"
                      />
                      <span>Twitter</span>
                    </motion.button>

                    {/* <motion.button
                     whileHover={{ scale: 1.05, backgroundColor: "#0077b5" }}
                     whileTap={{ scale: 0.95 }}
                     onClick={shareOnTelegram}
                     className="bg-[#0088cc] text-white py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                   >
                     <Image
                       src="/images/telegram.png"
                       alt="Telegram"
                       width={14}
                       height={14}
                       className="sm:w-4 sm:h-4"
                     />
                     <span>Telegram</span>
                   </motion.button> */}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-3 sm:mt-5 flex flex-col sm:flex-row">
                  <Input
                    id="link-input"
                    type="text"
                    defaultValue={`https://nft.xyz/?ref=${userData?.invitation_code}`}
                    readOnly
                    className="bg-gray-800 border-gray-700 text-white rounded-lg sm:rounded-l-lg sm:rounded-r-none text-xs sm:text-sm mb-2 sm:mb-0"
                  />
                  <motion.button
                    whileHover={{ backgroundColor: "#d4af37" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    className="bg-yellow-400 text-black py-2 px-3 sm:px-4 rounded-lg sm:rounded-l-none sm:rounded-r-lg flex items-center justify-center text-xs sm:text-sm"
                  >
                    <Clipboard size={14} className="mr-1 sm:mr-2 sm:h-4 sm:w-4" />
                    {buttonText}
                  </motion.button>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-2 sm:mt-3 text-white/50 text-xs sm:text-sm">
                  <span className="text-yellow-400 font-bold">{userData?.invited_accounts_count || 0}</span> friends invited so far
                </motion.div>
              </motion.div>

              {/* Tasks list */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-gray-900 rounded-xl border border-yellow-400/30 overflow-hidden"
              >
                <motion.div variants={itemVariants} className="p-3 sm:p-4 border-b border-yellow-400/20">
                  <h3 className="text-base sm:text-lg font-bold text-white">Complete Tasks</h3>
                  <p className="text-white/70 text-xs sm:text-sm">Earn points by completing these tasks</p>
                </motion.div>

                <div className="divide-y divide-yellow-400/10">
                  {/* Twitter Follow */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                    className="p-3 sm:p-4 flex items-center"
                  >
                    <div className={`min-w-[28px] h-7 sm:min-w-[32px] sm:h-8 flex items-center justify-center rounded-full ${isTwitterFollowed ? 'bg-yellow-400' : 'bg-gray-800'} mr-2 sm:mr-4`}>
                      {isTwitterFollowed ? (
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
                      <TwitterButton
                        isDisabled={isTwitterFollowed}
                        onFollowSuccess={refreshTwitterFollowStatus}
                      />
                    </div>
                    <div className="ml-2 sm:ml-4 flex items-center text-yellow-400 whitespace-nowrap">
                      <Zap size={14} className="mr-1 sm:h-4 sm:w-4" />
                      <span className="font-bold text-xs sm:text-sm">100</span>
                    </div>
                  </motion.div>

                  {/* Twitter II Follow */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                    className="p-3 sm:p-4 flex items-center"
                  >
                    <div className={`min-w-[28px] h-7 sm:min-w-[32px] sm:h-8 flex items-center justify-center rounded-full ${isTwitterIIFollowed ? 'bg-yellow-400' : 'bg-gray-800'} mr-2 sm:mr-4`}>
                      {isTwitterIIFollowed ? (
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
                      <TwitterIIButton
                        isDisabled={isTwitterIIFollowed}
                        onFollowSuccess={refreshTwitterIIFollowStatus}
                      />
                    </div>
                    <div className="ml-2 sm:ml-4 flex items-center text-yellow-400 whitespace-nowrap">
                      <Zap size={14} className="mr-1 sm:h-4 sm:w-4" />
                      <span className="font-bold text-xs sm:text-sm">100</span>
                    </div>
                  </motion.div>

                  {/* Twitter III Follow */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                    className="p-3 sm:p-4 flex items-center"
                  >
                    <div className={`min-w-[28px] h-7 sm:min-w-[32px] sm:h-8 flex items-center justify-center rounded-full ${isTwitterIIIFollowed ? 'bg-yellow-400' : 'bg-gray-800'} mr-2 sm:mr-4`}>
                      {isTwitterIIIFollowed ? (
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
                      <TwitterIIIButton
                        isDisabled={isTwitterIIIFollowed}
                        onFollowSuccess={refreshTwitterIIIFollowStatus}
                      />
                    </div>
                    <div className="ml-2 sm:ml-4 flex items-center text-yellow-400 whitespace-nowrap">
                      <Zap size={14} className="mr-1 sm:h-4 sm:w-4" />
                      <span className="font-bold text-xs sm:text-sm">100</span>
                    </div>
                  </motion.div>

                  {/* Discord Join */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                    className="p-3 sm:p-4 flex items-center"
                  >
                    <div className={`min-w-[28px] h-7 sm:min-w-[32px] sm:h-8 flex items-center justify-center rounded-full ${isDiscordJoined ? 'bg-yellow-400' : 'bg-gray-800'} mr-2 sm:mr-4`}>
                      {isDiscordJoined ? (
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
                      <DiscordButton
                        isDisabled={isDiscordJoined}
                        onFollowSuccess={refreshDiscordJoinStatus}
                      />
                    </div>
                    <div className="ml-2 sm:ml-4 flex items-center text-yellow-400 whitespace-nowrap">
                      <Zap size={14} className="mr-1 sm:h-4 sm:w-4" />
                      <span className="font-bold text-xs sm:text-sm">100</span>
                    </div>
                  </motion.div>

                  {/* Telegram II Join */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                    className="p-3 sm:p-4 flex items-center"
                  >
                    <div className={`min-w-[28px] h-7 sm:min-w-[32px] sm:h-8 flex items-center justify-center rounded-full ${isTelegramIIJoined ? 'bg-yellow-400' : 'bg-gray-800'} mr-2 sm:mr-4`}>
                      {isTelegramIIJoined ? (
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
                      <TelegramIIButton
                        isDisabled={isTelegramIIJoined}
                        onFollowSuccess={refreshTelegramFollowStatus}
                      />
                    </div>
                    <div className="ml-2 sm:ml-4 flex items-center text-yellow-400 whitespace-nowrap">
                      <Zap size={14} className="mr-1 sm:h-4 sm:w-4" />
                      <span className="font-bold text-xs sm:text-sm">100</span>
                    </div>
                  </motion.div>

                  {/* Solana Wallet Connection */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
                    className="p-3 sm:p-4 flex items-center"
                  >
                    <HodiWalletConnect
                      isDisabled={isSolanaWalletConnected}
                      onWalletConnectSuccess={(points) => {
                        setIsSolanaWalletConnected(true);
                        if (points > 0) {
                          triggerRewardAnimation(`Wallet connected with ${points.toLocaleString()} HODI holding bonus!`);
                        } else {
                          triggerRewardAnimation("Wallet connected! +200 points");
                        }
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}

          {/* REWARDS TAB */}
          {activeTab === 'rewards' && (
            <div className="p-3 sm:p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-5 sm:mb-8 bg-gray-900 p-4 sm:p-5 rounded-xl border border-yellow-400/30"
              >
                <motion.div variants={itemVariants} className="flex items-center mb-3 sm:mb-4">
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-2" />
                  <h3 className="text-base sm:text-lg font-bold text-white">$HODI Rewards Program</h3>
                </motion.div>
                <motion.p variants={itemVariants} className="text-white/70 mb-4 sm:mb-6 text-xs sm:text-sm">
                  Complete tasks and level up to unlock exclusive rewards for the $HODI project.
                </motion.p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Level 1 - Street Cat */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(234, 179, 8, 0.3)" }}
                    className={`p-3 sm:p-4 rounded-xl border ${getCurrentLevel() >= 1 ? 'bg-gradient-to-b from-yellow-400/20 to-transparent border-yellow-400' : 'bg-gray-800 border-gray-700'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <h4 className="font-bold text-sm sm:text-lg">Street Cat</h4>
                      <div className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-black text-white/70">Level 1</div>
                    </div>
                    <div className="text-white/70 text-[10px] sm:text-xs mb-2 sm:mb-3">Unlocks at 5,000 points</div>
                    <ul className="space-y-1 sm:space-y-2 text-[11px] sm:text-sm">
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 1 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 1 ? 'text-white' : 'text-white/50'}>Early Access to Mint</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 1 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 1 ? 'text-white' : 'text-white/50'}>Guaranteed Whitelist</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 1 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 1 ? 'text-white' : 'text-white/50'}>Access to Cat Cartel Events</span>
                      </li>
                    </ul>
                    {getCurrentLevel() >= 1 ? (
                      <div className="mt-3 sm:mt-4 text-yellow-400 text-[10px] sm:text-sm font-bold flex items-center">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> UNLOCKED
                      </div>
                    ) : (
                      <div className="mt-3 sm:mt-4 text-white/50 text-[10px] sm:text-sm flex items-center">
                        <Lock size={12} className="mr-1 sm:text-base" /> Locked
                      </div>
                    )}
                  </motion.div>

                  {/* Level 2 - Capo */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(234, 179, 8, 0.3)" }}
                    className={`p-3 sm:p-4 rounded-xl border ${getCurrentLevel() >= 2 ? 'bg-gradient-to-b from-yellow-400/20 to-transparent border-yellow-400' : 'bg-gray-800 border-gray-700'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <h4 className="font-bold text-sm sm:text-lg">Capo</h4>
                      <div className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-black text-white/70">Level 2</div>
                    </div>
                    <div className="text-white/70 text-[10px] sm:text-xs mb-2 sm:mb-3">Unlocks at 20,000 points</div>
                    <ul className="space-y-1 sm:space-y-2 text-[11px] sm:text-sm">
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 2 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 2 ? 'text-white' : 'text-white/50'}>All Street Cat Benefits</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 2 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 2 ? 'text-white' : 'text-white/50'}>Exclusive Discord Role</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 2 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 2 ? 'text-white' : 'text-white/50'}>Special Cat Traits</span>
                      </li>
                    </ul>
                    {getCurrentLevel() >= 2 ? (
                      <div className="mt-3 sm:mt-4 text-yellow-400 text-[10px] sm:text-sm font-bold flex items-center">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> UNLOCKED
                      </div>
                    ) : (
                      <div className="mt-3 sm:mt-4 text-white/50 text-[10px] sm:text-sm flex items-center">
                        <Lock size={12} className="mr-1 sm:text-base" /> Locked
                      </div>
                    )}
                  </motion.div>

                  {/* Level 3 - Big Boss  */}
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(234, 179, 8, 0.3)" }}
                    className={`p-3 sm:p-4 rounded-xl border ${getCurrentLevel() >= 3 ? 'bg-gradient-to-b from-yellow-400/20 to-transparent border-yellow-400' : 'bg-gray-800 border-gray-700'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <h4 className="font-bold text-sm sm:text-lg">Big Boss </h4>
                      <div className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-black text-white/70">Level 3</div>
                    </div>
                    <div className="text-white/70 text-[10px] sm:text-xs mb-2 sm:mb-3">Unlocks at 50,000 points</div>
                    <ul className="space-y-1 sm:space-y-2 text-[11px] sm:text-sm">
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 3 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 3 ? 'text-white' : 'text-white/50'}>All Capo Benefits</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 3 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 3 ? 'text-white' : 'text-white/50'}>OG Cat Status</span>
                      </li>
                      <li className="flex items-center">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 rounded-full ${getCurrentLevel() >= 3 ? 'bg-yellow-400' : 'bg-gray-700'}`}></div>
                        <span className={getCurrentLevel() >= 3 ? 'text-white' : 'text-white/50'}>$HODI Token Airdrop</span>
                      </li>
                    </ul>
                    {getCurrentLevel() >= 3 ? (
                      <div className="mt-3 sm:mt-4 text-yellow-400 text-[10px] sm:text-sm font-bold flex items-center">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> UNLOCKED
                      </div>
                    ) : (
                      <div className="mt-3 sm:mt-4 text-white/50 text-[10px] sm:text-sm flex items-center">
                        <Lock size={12} className="mr-1 sm:text-base" /> Locked
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-gray-900 p-3 sm:p-5 rounded-xl border border-yellow-400/30"
              >
                <motion.div variants={itemVariants} className="flex justify-between items-center mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-2" />
                    <h3 className="text-base sm:text-lg font-bold text-white">NFT Benefits</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRewardDetailOpen(!isRewardDetailOpen)}
                    className="text-yellow-400 flex items-center text-xs sm:text-sm bg-black px-2 py-1 sm:px-3 sm:py-1 rounded-full"
                  >
                    {isRewardDetailOpen ? "Less" : "Details"}
                    {isRewardDetailOpen ? <ChevronUp size={14} className="ml-1 sm:h-4 sm:w-4" /> : <ChevronDown size={14} className="ml-1 sm:h-4 sm:w-4" />}
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4"
                >
                  <div className="text-center p-2 sm:p-3 bg-black rounded-lg border border-yellow-400/20">
                    <div className="inline-block p-2 rounded-full bg-yellow-400/20 mb-1 sm:mb-2">
                      <Trophy size={18} className="text-yellow-400 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-xs sm:text-sm font-medium">VIP Access</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-black rounded-lg border border-yellow-400/20">
                    <div className="inline-block p-2 rounded-full bg-yellow-400/20 mb-1 sm:mb-2">
                      <DollarSign size={18} className="text-yellow-400 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-xs sm:text-sm font-medium">NFT Rewards</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-black rounded-lg border border-yellow-400/20">
                    <div className="inline-block p-2 rounded-full bg-yellow-400/20 mb-1 sm:mb-2">
                      <Zap size={18} className="text-yellow-400 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-xs sm:text-sm font-medium">NFT Airdrops</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-black rounded-lg border border-yellow-400/20">
                    <div className="inline-block p-2 rounded-full bg-yellow-400/20 mb-1 sm:mb-2">
                      <Lock size={18} className="text-yellow-400 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-xs sm:text-sm font-medium">Governance</div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isRewardDetailOpen && (
                    <motion.div
                      variants={itemVariants}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-white/70 text-xs sm:text-sm bg-black p-3 sm:p-4 rounded-lg border border-yellow-400/20"
                    >
                      <p className="mb-2 sm:mb-3">
                        NFT holders will receive exclusive benefits in the ecosystem:
                      </p>
                      <ul className="space-y-1 sm:space-y-2 ml-3 sm:ml-4 list-disc">
                        <li>Priority access to future NFT launches</li>
                        <li>Revenue share from marketing activities</li>
                        <li>Access to private Discord channels and events</li>
                        <li>Staking rewards with passive income opportunities</li>
                        <li>NFT airdrops based on your level and referral activity</li>
                        <li>Voting rights on future project developments</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* POINTS HISTORY TAB */}
          {activeTab === 'points' && (
            <div className="p-3 sm:p-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-black bg-opacity-90 p-3 sm:p-5 rounded-xl border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                <motion.div variants={itemVariants} className="flex justify-between items-center mb-3 sm:mb-4">
                  <div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-1 sm:mr-2" />
                      <h3 className="text-base sm:text-lg font-bold text-yellow-400">Points History</h3>
                    </div>
                    <p className="text-white/70 text-[10px] sm:text-xs mt-0.5 sm:mt-1">Your recent points transactions</p>
                  </div>
                  <div className="bg-black py-1 px-2 sm:px-3 rounded-full text-white font-bold border border-yellow-400 text-xs sm:text-base">
                    <span className="text-yellow-400">{userPointsTotal}</span> points
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-black">
                      <TableRow className="border-b border-yellow-400/20">
                        <TableHead className="text-yellow-400 font-bold text-xs sm:text-sm p-2 sm:p-4">Points</TableHead>
                        <TableHead className="text-yellow-400 font-bold text-xs sm:text-sm p-2 sm:p-4">Activity</TableHead>
                        <TableHead className="text-yellow-400 font-bold text-xs sm:text-sm p-2 sm:p-4 hidden md:table-cell">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-black">
                      {pointsList && pointsList.length > 0 ? (
                        pointsList.map((point: Point, index: number) => (
                          <TableRow key={index} className="border-b border-gray-800 hover:bg-black/50">
                            <TableCell className="font-medium text-yellow-400 text-xs sm:text-sm p-2 sm:p-4">+{point.amount}</TableCell>
                            <TableCell className="text-white text-xs sm:text-sm p-2 sm:p-4">{point.note}</TableCell>
                            <TableCell className="hidden md:table-cell text-white/50 text-xs sm:text-sm p-2 sm:p-4">
                              {new Date(point.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 sm:py-8 text-white/50 text-xs sm:text-sm">
                            <div className="flex flex-col items-center">
                              <Lock className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-yellow-400/30" />
                              <span>No points activity yet. Complete tasks to earn points!</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-3 sm:mt-4 text-white/50 text-xs sm:text-sm text-center">
                  Complete more tasks to join the $HODI gang elite!
                </motion.div>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}