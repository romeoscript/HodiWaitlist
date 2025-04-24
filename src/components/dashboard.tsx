"use client";

import { useState } from "react";
import LeaderboardTab from "./LeaderboardTab";
import TasksTab from "./TasksTab";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Dashboard() {
  const [showDropInfo, setShowDropInfo] = useState(false);

  return (
    <div className="body-background flex items-center justify-center min-h-screen pt-[4em]">
      {showDropInfo ? (
        <Card className="w-full max-w-md bg-opacity-80 p-6 rounded-lg">
          <CardHeader>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-points">
                Waitlist Closed
              </CardTitle>
              <CardTitle className="text-2xl font-bold text-points">
                Mint Details:
              </CardTitle>
              <CardTitle className="text-2xl font-bold text-points">
                Date: January 30th
              </CardTitle>
              <CardTitle className="text-2xl font-bold text-points">
                Time: 10 am EST!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() =>
                  window.open(
                    "https://app.blever.xyz/drops/sprout-citizens",
                    "_blank"
                  )
                }
                className="w-full font-bold text-foreground"
                variant="specialAction"
              >
                <Image
                  src="/images/blever.png"
                  alt="twitter"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Drop Page
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      ) : (
        <Tabs defaultValue="task" className="w-full self-start">
          <TabsList className="grid w-full grid-cols-2 max-w-screen-md mx-auto mt-8">
            <TabsTrigger value="task">Tasks</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          <TabsContent
            value="task"
            className="w-full max-w-screen-xl mx-auto mt-8"
          >
            <TasksTab />
          </TabsContent>
          <TabsContent
            value="leaderboard"
            className="w-full max-w-screen-xl mx-auto mt-8"
          >
            <LeaderboardTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
