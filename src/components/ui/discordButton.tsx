import React from 'react';
import { Button } from "./button";
import Image from 'next/image';
import { discordPoints } from '@/app/actions';

interface DiscordButtonProps {
  isDisabled: boolean;
  onFollowSuccess: () => void;
}

const DiscordButton: React.FC<DiscordButtonProps> = ({ isDisabled, onFollowSuccess }) => {
  const handleFollowClick = async () => {
    window.open('https://discord.gg/CqdnWc989A', '_blank');
    const success = await discordPoints();
    if (success) {
      onFollowSuccess();
    }
  };

  return (
    <Button
      className=" text-foreground p-4 text-center rounded-lg font-bold text-sm flex items-center justify-center"
      onClick={handleFollowClick}
      disabled={isDisabled}
      variant={"specialAction"}

    >
      <Image
        src="/images/discord.png"
        alt="discord"
        width={24}
        height={24}
        className="mr-2"
      />
      <span>Join to our Discord</span>
    </Button>
  );
};

export default DiscordButton;
