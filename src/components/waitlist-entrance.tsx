/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion"; // Note: You'll need to install framer-motion

export default function WaitlistEntrance() {
  const [showDropInfo, setShowDropInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  async function signInWithTwitter() {
    "use client";
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <Image 
            src="/images/hodi-logo.png" 
            alt="HODI" 
            width={200} 
            height={200}
            className="animate-pulse"
          />
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-hodi-yellow mt-8"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="body-background flex items-center justify-center min-h-screen overflow-hidden mb-20">
      {showDropInfo ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md bg-opacity-80 p-6 rounded-lg shadow-xl border border-hodi-yellow/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-hodi-yellow">
                Waitlist Closed
              </CardTitle>
              <CardTitle className="text-2xl font-bold text-hodi-yellow">
                Mint Details:
              </CardTitle>
              <CardTitle className="text-2xl font-bold text-hodi-yellow">
                Date: May 1st, 2025
              </CardTitle>
              <CardTitle className="text-2xl font-bold text-hodi-yellow">
                Time: 10 am EST!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() =>
                  window.open(
                    "https://app.blever.xyz/drops/hodi",
                    "_blank"
                  )
                }
                className="w-full font-bold text-black bg-hodi-yellow hover:bg-black hover:text-hodi-yellow border border-hodi-yellow transition-all duration-300 group transform hover:scale-105"
              >
                <Image
                  src="/images/hodi-icon.png"
                  alt="HODI"
                  width={24}
                  height={24}
                  className="mr-2 rounded-full group-hover:rotate-12 transition-all duration-300"
                />
                <span className="group-hover:tracking-wider transition-all duration-300">Drop Page</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md bg-opacity-80 p-6 rounded-lg shadow-xl border border-hodi-yellow/20">
            <CardHeader>
              <div className="flex justify-center mb-6">
                <Image
                  src="/images/hodi-logo.png"
                  alt="HODI"
                  width={120}
                  height={120}
                  className="rounded-full shadow-lg border-2 border-hodi-yellow"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-hodi-yellow mb-4">
                Join the HODI Cartel
              </CardTitle>
              <div className="pt-2 flex flex-col gap-4 text-sm">
                <div className="pt-2 flex flex-col gap-4 text-base">
                  <div className="text-center">
                    The OG gangsta cat token is here. Sign in below to complete
                    tasks and secure your position in the Cat Cartel.
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Button
                onClick={signInWithTwitter}
                className="w-full font-bold text-black bg-hodi-yellow hover:bg-black hover:text-hodi-yellow border border-hodi-yellow transition-all duration-300 group transform hover:scale-105"
              >
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={24}
                  height={24}
                  className="mr-2 group-hover:rotate-12 transition-all duration-300"
                />
                <span className="group-hover:tracking-wider transition-all duration-300">
                  Sign in with X / Twitter
                </span>
              </Button>
              
              <div className="mt-6 text-center text-sm opacity-80">
                By signing in, you're joining the exclusive waitlist for the $HODI token launch
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}