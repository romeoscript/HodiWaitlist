import React, { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { LockKeyholeOpen } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { claimCode } from "@/app/actions";
import { useRouter } from "next/navigation";

type InvitationCodeProps = {
  isLoading: boolean;
  code: string;
  setCode: (code: string) => void;
};

export default function InvitationCode({
  isLoading,
  code,
  setCode,
}: InvitationCodeProps) {
  const [checkingCode, setCheckingCode] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCheckCode = async () => {
    setCheckingCode(true);
    const success = await claimCode(code);
    if (success) {
      toast({
        title: "Success",
        description: "Welcome to Cat Cartel!",
      });
      router.push("/dashboard");
    } else {
      toast({
        title: "Invalid Invitation Code",
        description: "Please enter a valid invitation code",
      });
    }
    setCheckingCode(false);
  };

  return (
    <Card className="bg-black bg-opacity-90 border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
      <CardHeader className="text-center md:text-left">
        <CardTitle className="text-yellow-400 text-2xl font-bold tracking-wider">HODI WAITLIST</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {isLoading ? (
          <>
            <Skeleton className="w-full mt-4 h-16 bg-yellow-400/20" />
            <Skeleton className="w-full mt-4 h-12 bg-yellow-400/20" />
          </>
        ) : (
          <div className="my-0 md:my-4">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={code}
              onChange={(newValue: string) => setCode(newValue)}
              inputMode="text"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="md:w-16 md:h-16 text-lg bg-yellow-400/10 border-yellow-400 text-yellow-400" />
                <InputOTPSlot index={1} className="md:w-16 md:h-16 text-lg bg-yellow-400/10 border-yellow-400 text-yellow-400" />
                <InputOTPSlot index={2} className="md:w-16 md:h-16 text-lg bg-yellow-400/10 border-yellow-400 text-yellow-400" />
                <InputOTPSlot index={3} className="md:w-16 md:h-16 text-lg bg-yellow-400/10 border-yellow-400 text-yellow-400" />
                <InputOTPSlot index={4} className="md:w-16 md:h-16 text-lg bg-yellow-400/10 border-yellow-400 text-yellow-400" />
                <InputOTPSlot index={5} className="md:w-16 md:h-16 text-lg bg-yellow-400/10 border-yellow-400 text-yellow-400" />
              </InputOTPGroup>
            </InputOTP>
            <Button
              onClick={handleCheckCode}
              className="w-full text-black mt-4 font-bold bg-yellow-400 hover:bg-yellow-500 transition-colors"
              disabled={checkingCode}
            >
              {checkingCode ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <LockKeyholeOpen className="mr-2" />
              )}
              Claim My HODI Code
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <div className="text-sm text-yellow-400/80 text-center">
          Don&apos;t have an invitation code?{" "}
          <a
            href="https://discord.gg/CqdnWc989A"
            target="_blank"
            className="text-yellow-400 underline underline-offset-4 block md:inline-block hover:text-yellow-300 transition-colors"
          >
            Join our Discord to get one
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}