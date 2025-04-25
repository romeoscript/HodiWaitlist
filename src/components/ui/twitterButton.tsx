import React, { useState } from 'react';
import { Button } from "./button";
import Image from 'next/image';
import { twitterPoints, twitterIIPoints, twitterIIIPoints } from '@/app/actions';
import { useToast } from "./use-toast";

interface TwitterButtonProps {
  isDisabled: boolean;
  onFollowSuccess: () => void;
}

const TwitterButton: React.FC<TwitterButtonProps> = ({ isDisabled, onFollowSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFollowClick = async () => {
    setIsProcessing(true);
    window.open('https://twitter.com/intent/follow?screen_name=hoditoken', '_blank');
    
    try {
      const success = await twitterPoints();
      if (success) {
        toast({
          title: "Success!",
          description: "You've earned 100 points for following HODI on Twitter! 🎉",
        });
        onFollowSuccess();
      } else {
        toast({
          title: "Verification failed",
          description: "Please make sure you followed the account and try again.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      className="text-foreground p-2 text-center rounded-lg font-bold text-xs flex items-center justify-center"
      onClick={handleFollowClick}
      disabled={isDisabled || isProcessing}
      variant={"specialAction"}
    >
      {isProcessing ? (
        <>
          <div className="h-3 w-3 border-t-2 border-r-2 border-current rounded-full animate-spin mr-1"></div>
          Verifying...
        </>
      ) : (
        <>
          <Image
            src="/images/twitter.png"
            alt="twitter"
            width={16}
            height={16}
            className="mr-2"
          />
          <span>Follow on X/Twitter</span>
        </>
      )}
    </Button>
  );
};

const TwitterIIButton: React.FC<TwitterButtonProps> = ({ isDisabled, onFollowSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFollowClick = async () => {
    setIsProcessing(true);
    window.open('https://twitter.com/intent/follow?screen_name=hodifounder', '_blank');
    
    try {
      const success = await twitterIIPoints();
      if (success) {
        toast({
          title: "Success!",
          description: "You've earned 100 points for following HODI Founder! 🎉",
        });
        onFollowSuccess();
      } else {
        toast({
          title: "Verification failed",
          description: "Please make sure you followed the account and try again.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      className="text-foreground p-4 text-center rounded-lg font-bold text-sm flex items-center justify-center"
      onClick={handleFollowClick}
      disabled={isDisabled}
      variant={"specialAction"}
    >
      <Image
        src="/images/twitter.png"
        alt="twitter"
        width={24}
        height={24}
        className="mr-2"
      />
      <span>Follow $HODI on Twitter</span>
    </Button>
  );
};

const TwitterIIIButton: React.FC<TwitterButtonProps> = ({ isDisabled, onFollowSuccess }) => {
  const handleFollowClick = async () => {
    window.open('https://twitter.com/intent/follow?screen_name=Ares_Sprout', '_blank');
    const success = await twitterIIIPoints();
    if (success) {
      onFollowSuccess();
    }
  };

  return (
    <Button
      className="text-foreground p-4 text-center rounded-lg font-bold text-sm flex items-center justify-center"
      onClick={handleFollowClick}
      disabled={isDisabled}
      variant={"specialAction"}
    >
      <Image
        src="/images/twitter.png"
        alt="twitter"
        width={24}
        height={24}
        className="mr-2"
      />
      <span>Follow Cat Cartel on Twitter</span>
    </Button>
  );
};

export { TwitterButton, TwitterIIButton, TwitterIIIButton }
