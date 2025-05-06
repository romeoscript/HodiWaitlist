import React from 'react';
import { Button } from "./button";
import Image from 'next/image';
import { TelegramPoints, TelegramIIPoints } from '@/app/actions';

interface TelegramButtonProps {
  isDisabled: boolean;
  onFollowSuccess: () => void;
}

const TelegramButton: React.FC<TelegramButtonProps> = ({ isDisabled, onFollowSuccess }) => {
  const handleFollowClick = async () => {
    window.open('https://t.me/+08Nhs768JHJjZWFh', '_blank');
    const success = await TelegramPoints();
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
        src="/images/telegram.png"
        alt="telegram"
        width={24}
        height={24}
        className="mr-2"
      />
      <span>Join us on Telegram</span>
    </Button>
  );
};

const TelegramIIButton: React.FC<TelegramButtonProps> = ({ isDisabled, onFollowSuccess }) => {
  const handleFollowClick = async () => {
    window.open('https://t.me/hodicoin', '_blank');
    const success = await TelegramIIPoints();
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
        src="/images/telegram.png"
        alt="telegram"
        width={24}
        height={24}
        className="mr-2"
      />
      <span>Subscribe to Telegram Channel</span>
    </Button>
  );
};

export { TelegramButton, TelegramIIButton }
