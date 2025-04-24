/* eslint-disable react/no-unescaped-entities */
// src/components/waitlist-entrance.tsx
"use client";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function WaitlistEntrance() {
  const [showDropInfo, setShowDropInfo] = useState(false);

  async function signInWithTwitter() {
    "use client";
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
    });
  }

  return (
    <div className="body-background flex items-center justify-center min-h-screen overflow-hidden mb-20">
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
        <Card className="w-full max-w-md bg-opacity-80 p-6 rounded-lg">
          <CardHeader>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-points">
                Welcome
              </CardTitle>
              <div className="pt-2 flex flex-col gap-4 text-sm text-muted-foreground">
                <div className="pt-2 flex flex-col gap-4 text-sm text-nuutext">
                  <div>
                    The Sprout Citizens are here. Sign in below to complete
                    tasks and claim your spot in The Garden.
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={signInWithTwitter}
                className="w-full font-bold text-foreground"
                variant="specialAction"
              >
                <Image
                  src="/images/twitter.png"
                  alt="twitter"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Sign in with X / Twitter
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
