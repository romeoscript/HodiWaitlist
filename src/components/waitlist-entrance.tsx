/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Lock, Zap, Star, Crown } from "lucide-react";

interface ConfettiProps {
  show: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-10"
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
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
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: i % 2 === 0 ? "#FFD700" : "#000000",
              boxShadow: "0 0 10px rgba(255, 215, 0, 0.7)"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default function WaitlistEntrance() {
  const [showDropInfo, setShowDropInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  async function signInWithTwitter() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
    });
  }

  // Background grid animation variants
  const gridVariants = {
    animate: {
      backgroundPosition: ["0px 0px", "20px 20px"],
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  // Floating animation for logo
  const floatAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 215, 0, 0.3) 1px, transparent 0)",
            backgroundSize: "30px 30px"
          }}
        ></div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center relative z-10"
        >
          <motion.div
            animate={{
              rotate: 360,
              boxShadow: ["0 0 20px rgba(255, 215, 0, 0.5)", "0 0 40px rgba(255, 215, 0, 0.8)", "0 0 20px rgba(255, 215, 0, 0.5)"]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 2, repeat: Infinity, repeatType: "reverse" }
            }}
            className="rounded-full p-2 bg-black"
          >
            <Image 
              src="/images/logo.jpg" 
              alt="HODI" 
              width={180} 
              height={180}
              className="animate-pulse rounded-full"
            />
          </motion.div>
          
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="mt-10 rounded-full h-16 w-16 border-4 border-r-yellow-400 border-l-yellow-600 border-t-yellow-500 border-b-yellow-300"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-6 text-yellow-400 font-bold text-xl tracking-widest"
          >
            LOADING CARTEL ACCESS
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="relative flex items-center justify-center min-h-screen overflow-hidden"
      variants={gridVariants}
      animate="animate"
      style={{
        backgroundImage: "radial-gradient(rgba(255, 215, 0, 0.2) 1px, transparent 0)",
        backgroundSize: "30px 30px"
      }}
    >
      <Confetti show={showConfetti} />

      {/* Floating NFT symbols in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + (Math.random() * 0.3)
            }}
            animate={{ 
              y: [0, -30, 0],
              rotate: Math.random() > 0.5 ? [0, 360] : [360, 0]
            }}
            transition={{ 
              y: { 
                duration: 2 + Math.random() * 3, 
                repeat: Infinity, 
                repeatType: "reverse" as const
              },
              rotate: {
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            className="absolute text-yellow-500"
            style={{ fontSize: `${20 + Math.random() * 30}px` }}
          >
            {Math.random() > 0.7 ? "🎨" : "🖼️"}
          </motion.div>
        ))}
      </div>

      {showDropInfo ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Card className="w-full max-w-md bg-black bg-opacity-90 p-6 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.3)] border-2 border-yellow-400">
            <CardHeader className="pb-0">
              <motion.div 
                className="flex justify-center mb-6"
                variants={floatAnimation}
                animate="animate"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      boxShadow: ["0 0 15px rgba(255, 215, 0, 0.5)", "0 0 30px rgba(255, 215, 0, 0.8)", "0 0 15px rgba(255, 215, 0, 0.5)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 rounded-full"
                  ></motion.div>
                  <Crown className="text-yellow-400 mx-auto h-16 w-16 mb-2" />
                </div>
              </motion.div>
              
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-yellow-400 mb-2">
                NFT Mint Coming Soon
              </CardTitle>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-yellow-400/20">
                  <span className="text-white text-lg">Mint Date</span>
                  <span className="text-yellow-400 font-bold">May 1st, 2025</span>
                </div>
                
                <div className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-yellow-400/20">
                  <span className="text-white text-lg">Mint Time</span>
                  <span className="text-yellow-400 font-bold">10 AM EST</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Lock className="text-yellow-400 h-5 w-5" />
                  <span className="text-white">Limited Collection of 10,000 NFTs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="text-yellow-400 h-5 w-5" />
                  <span className="text-white">Exclusive NFT Rewards & Benefits</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="text-yellow-400 h-5 w-5" />
                  <span className="text-white">Early Access to Future Drops</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Card className="w-full max-w-md bg-black bg-opacity-90 p-6 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.3)] border-2 border-yellow-400">
            <CardHeader className="pb-0">
              <motion.div 
                className="flex justify-center mb-6"
                variants={floatAnimation}
                animate="animate"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoverButton(true)}
                  onHoverEnd={() => setHoverButton(false)}
                  className="w-full"
                >
                  <Image
                    src="/images/logo.jpg"
                    alt="HODI"
                    width={140}
                    height={140}
                    className="rounded-full m-auto shadow-[0_0_20px_rgba(255,215,0,0.5)] border-4 border-yellow-400"
                  />
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-yellow-400 mb-4 tracking-wider">
                  JOIN THE CAT CARTEL
                </CardTitle>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="pt-2 flex flex-col gap-4"
              >
                <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-400/20 text-center text-white leading-relaxed">
                  The OG gangsta cat NFT collection is here. Complete tasks, earn rewards, and secure your position in the Cat Cartel.
                  <div className="text-yellow-400 font-bold mt-1 text-sm">
                    Early members get exclusive NFT benefits!
                  </div>
                </div>
              </motion.div>
            </CardHeader>
            {/* ts-ignore */}
            <CardContent className="flex flex-col items-center pt-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoverButton(true)}
                onHoverEnd={() => setHoverButton(false)}
                className="w-full"
              >
                <Button
                  onClick={signInWithTwitter}
                  className="w-full py-6 font-bold text-black bg-yellow-400 hover:bg-black hover:text-yellow-400 border-2 border-yellow-400 transition-all duration-300 group transform rounded-xl relative overflow-hidden"
                >
                  <AnimatePresence>
                    {hoverButton && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: [1, 1.5, 1] }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="bg-yellow-400/20 rounded-full h-20 w-20 animate-ping" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="relative flex items-center justify-center">
                    <Image
                      src="/images/twitter.png"
                      alt="Twitter"
                      width={30}
                      height={30}
                      className="mr-3 group-hover:rotate-12 transition-all duration-300"
                    />
                    <span className="text-lg group-hover:tracking-wider transition-all duration-300">
                      SIGN IN WITH X
                    </span>
                  </div>
                </Button>
              </motion.div>
              
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Lock className="h-4 w-4 text-yellow-400 mr-2" />
                  <span className="text-yellow-400 font-bold text-sm">EXCLUSIVE ACCESS</span>
                </div>
                <p className="text-white/70 text-sm">
                  Join the waitlist to participate in the exclusive NFT collection mint
                </p>
              </div>
              
              <motion.div 
                className="flex items-center justify-center mt-6 space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800 rounded-full h-10 w-10 flex items-center justify-center mb-1">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-white text-xs">Earn Points</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800 rounded-full h-10 w-10 flex items-center justify-center mb-1">
                    <Zap className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-white text-xs">Complete Tasks</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800 rounded-full h-10 w-10 flex items-center justify-center mb-1">
                    <Crown className="h-5 w-5 text-yellow-400" />
                  </div>
                  <span className="text-white text-xs">Claim Rewards</span>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}