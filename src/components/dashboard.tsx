"use client";

import { useState, useEffect } from "react";
import LeaderboardTab from "./LeaderboardTab";
import TasksTab from "./TasksTab";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Image from "next/image";
import { Sparkles, Trophy, ListChecks, Flame, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [showDropInfo, setShowDropInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("task");
  const [animateTab, setAnimateTab] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Handle tab change with animation
  const handleTabChange = (tab: string) => {
    setAnimateTab(true);
    setActiveTab(tab);
    
    // Reset animation state after transition
    setTimeout(() => {
      setAnimateTab(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-4 border-t-4 border-yellow-400"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center min-h-screen pt-[4em]  md:px-4"
      style={{
        
        backgroundImage: "radial-gradient(rgba(50, 50, 50, 0.3) 1px, transparent 0)",
        backgroundSize: "20px 20px",
        backgroundPosition: "-15px -15px",
      }}
    >
      {showDropInfo ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto" 
        >
          <Card className="bg-black bg-opacity-90 p-4 sm:p-6 rounded-lg border border-yellow-400 transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
            <CardHeader className="space-y-2 p-3 sm:p-6">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 blur opacity-70 animate-pulse"></div>
                  <div className="relative bg-black rounded-full p-3 border border-yellow-400">
                    <Flame className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400 text-center">
                Waitlist Closed
              </CardTitle>
              <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400 text-center">
                Mint Details:
              </CardTitle>
              <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400 text-center">
                Date: January 30th
              </CardTitle>
              <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-400 text-center">
                Time: 10 am EST!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Button
                onClick={() =>
                  window.open(
                    "https://app.blever.xyz/drops/sprout-citizens",
                    "_blank"
                  )
                }
                className="w-full font-bold text-black bg-yellow-400 transform transition-all duration-300 hover:scale-105 group py-3 text-base sm:text-lg"
                variant="default"
              >
                <DollarSign
                  width={20}
                  height={20}
                  className="mr-2 group-hover:rotate-12 transition-all duration-300"
                />
                <span className="group-hover:tracking-wider transition-all">Drop Page</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className={`w-full transition-opacity duration-500 ${animateTab ? 'opacity-0' : 'opacity-100'}`}>
          <Tabs 
            defaultValue="task" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full self-start"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-sm sm:max-w-md mx-auto mt-4 sm:mt-8 shadow-lg overflow-hidden bg-black border border-yellow-400 rounded-lg">
              <TabsTrigger 
                value="task" 
                className="relative overflow-hidden transition-all duration-300 py-2 sm:py-3 text-sm sm:text-base data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-white"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-bold">Tasks</span>
                </div>
                {activeTab === "task" && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-500 animate-pulse"></div>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard"
                className="relative overflow-hidden transition-all duration-300 py-2 sm:py-3 text-sm sm:text-base data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-white"
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-bold">Leaderboard</span>
                </div>
                {activeTab === "leaderboard" && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-500 animate-pulse"></div>
                )}
              </TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-screen-xl mx-auto mt-4 sm:mt-8"
              >
                <TabsContent
                  value="task"
                  className="w-full"
                >
                  <TasksTab />
                </TabsContent>
                <TabsContent
                  value="leaderboard"
                  className="w-full"
                >
                  <LeaderboardTab />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      )}
    </div>
  );
}