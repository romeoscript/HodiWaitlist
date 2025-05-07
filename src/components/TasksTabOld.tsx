import { useEffect, useState } from "react";
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
import { Clipboard, Square, SquareRadical, Twitter } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
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
import { MetaMaskSDK } from "@metamask/sdk";

const COPY_BTN_TEXT = "Copy ref link";

export default function TasksTab() {
  const [buttonText, setButtonText] = useState(COPY_BTN_TEXT);
  const [isTwitterFollowed, setIsTwitterFollowed] = useState(false);
  const [isTwitterIIFollowed, setIsTwitterIIFollowed] = useState(false);
  const [isTwitterIIIFollowed, setIsTwitterIIIFollowed] = useState(false);
  const [isDiscordJoined, setIsDiscordJoined] = useState(false);
  const [isTelegramJoined, setIsTelegramJoined] = useState(false);
  const [isTelegramIIJoined, setIsTelegramIIJoined] = useState(false);
  const [isPlugWalletConnected, setIsPlugWalletConnected] = useState(false);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const [userData, setUserData] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pointsList, setPointsList] = useState<PointList[] | null>(null);
  const [userPointsTotal, setUserPointsTotal] = useState<number>();
  const { toast } = useToast();

  // copy to clipboard
  const copyToClipboard = async () => {
    const link = document.getElementById("link-input") as HTMLInputElement;
    await navigator.clipboard.writeText(link.value);
    setButtonText("Copied!");
    setTimeout(() => setButtonText(COPY_BTN_TEXT), 3000);
  };

  const refreshTwitterFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterFollowed();
      setIsTwitterFollowed(!!followed);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTwitterIFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterFollowed();
      setIsTwitterFollowed(!!followed);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTwitterIIFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterIIFollowed();
      setIsTwitterIIFollowed(!!followed);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTwitterIIIFollowStatus = async () => {
    setIsLoading(true);
    try {
      const followed = await fetchTwitterIIIFollowed();
      setIsTwitterIIIFollowed(!!followed);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDiscordJoinStatus = async () => {
    setIsLoading(true);
    try {
      const joined = await fetchDiscordJoined();
      setIsDiscordJoined(!!joined);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTelegramJoinStatus = async () => {
    setIsLoading(true);
    try {
      const joined = await fetchTelegramJoined();
      setIsTelegramJoined(!!joined);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTelegramFollowStatus = async () => {
    setIsLoading(true);
    try {
      const joined = await fetchTelegramIIJoined();
      setIsTelegramIIJoined(!!joined);
    } finally {
      setIsLoading(false);
    }
  };

  const MMSDK = new MetaMaskSDK({
    dappMetadata: {
      name: "Sprout NFT Dapp",
    },
    infuraAPIKey: process.env.INFURA_API_KEY,
    // Other options
  });
  
  const connectMetaMask = async () => {
    const accounts = await MMSDK.connect();
    const ethereum = MMSDK.getProvider();
    if (ethereum) {
      setIsLoading(true);
      try {
        ethereum.request({ method: "eth_accounts", params: [] });
        const principalId = ethereum.getSelectedAddress();
        if (principalId) {
          const success = await savePrincipalId(principalId.toString());
          if (success) {
            toast({
              title: "Success",
              description: "Your MetaMask wallet has been successfully connected 🥳",
            });
            setIsMetaMaskConnected(true);
          }
        } else {
          console.log("MetaMask Wallet is not available.");
          toast({
            title: "Unavailable",
            description:
              "MetaMask wallet is not available. Please install MetaMask wallet to connect.",
          });
        }
      } catch (error) {
        console.error("MetaMask Wallet connection error:", error);
        toast({
          title: "Error",
          description: "Failed to connect your MetaMask wallet.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };


  const isPlugWalletAvailable = () => {
    return window.ic && window.ic.plug;
  };

  const connectPlugWallet = async () => {
    if (isPlugWalletAvailable()) {
      setIsLoading(true);
      try {
        await window.ic.plug.requestConnect();
        const principalId = window.ic.plug.principalId;
        const success = await savePrincipalId(principalId.toString());
        if (success) {
          toast({
            title: "Success",
            description: "Your Plug wallet has been successfully connected 🥳",
          });
          setIsPlugWalletConnected(true);
        }
      } catch (error) {
        console.error("Plug Wallet connection error:", error);
        toast({
          title: "Error",
          description: "Failed to connect your Plug wallet.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Plug Wallet is not available.");
      toast({
        title: "Unavailable",
        description:
          "Plug wallet is not available. Please install Plug wallet to connect.",
      });
    }
  };

  // setup the share text

  const shareText = `Sprout Citizens are coming to @AbstractChain 

They’re a super limited collection backed by a strong Web3 marketing studio👀

Join me on the waitlist & start earning points with my referral link:

https://citizens.sproutmarketing.xyz/?ref=${userData?.invitation_code}`;

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;
    window.open(url, "_blank");
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      "sproutmarketing.xyz"
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    setIsLoading(true);

    const loadData = async () => {
      let total: number = 0;
      const fetchUser = await fetchAccount();
      const fetchedPointsList = await fetchPointsList();
      await setPointsList(fetchedPointsList);
      await setUserData(fetchUser);
      await setIsTwitterFollowed(
        fetchedPointsList?.some(
          // (point) => point.note === "Follow Galaxy.do on Twitter"
          (point) => point.note === "Follow Sprout Citizens on Twitter"
        ) || false
      );
      await setIsTwitterIIFollowed(
        fetchedPointsList?.some(
          // (point) => point.note === "Follow Galaxy.do on Twitter"
          (point) => point.note === "Follow $HODI on Twitter"
        ) || false
      );
      await setIsTwitterIIIFollowed(
        fetchedPointsList?.some(
          // (point) => point.note === "Follow Galaxy.do on Twitter"
          (point) => point.note === "Follow Kev the Dev on X"
        ) || false
      );
      await setIsDiscordJoined(
        fetchedPointsList?.some(
          (point) => point.note === "Joined Discord Cat Cartel"
        ) || false
      );
      await setIsTelegramJoined(
        fetchedPointsList?.some(
          (point) => point.note === "Joined Telegram Community"
        ) || false
      );
      await setIsTelegramIIJoined(
        fetchedPointsList?.some(
          (point) => point.note === "Joined Telegram Channel"
        ) || false
      );
      //await setIsPlugWalletConnected(fetchUser?.principal_id ? true : false);
      await setIsMetaMaskConnected(fetchUser?.principal_id ? true : false);

      // console.log(fetchedPointsList, fetchUser, "yo");

      await fetchedPointsList?.forEach((p) => {
        total += p.amount;
      });

      setUserPointsTotal(total);
    };
    loadData().finally(() => {
      setIsLoading(false);
    });
    if (isMetaMaskConnected || isTwitterFollowed) {
      loadData();
    }
  }, [isMetaMaskConnected, isTwitterFollowed]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-points"></div>
      </div>
    );
  }

  return (
    <Card className="">
      <CardContent className="p-0">
        <div className="md:hidden">
          <div className="py-6 px-4">
            <div className="flex justify-left items-center">
              <CardTitle className="text-black">
                You have earned {userPointsTotal} points 🎉
              </CardTitle>
              <Button
                onClick={() => setShowPoints(!showPoints)}
                className="ml-4 hover:bg-[#91A267] points:bg-[#5F7C23] text-nuutext"
              >
                {showPoints ? "Hide Points" : "Show Points"}
              </Button>
            </div>
            {showPoints && (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Points</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pointsList?.slice(0, 20)?.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>{point.amount}</TableCell>
                      <TableCell>{point.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 md:border-r border-border px-4 py-6">
            <div className="flex gap-[3em] items-center flex-col-reverse lg:flex-row">
              <div>
                <CardTitle style={{ color: "#1A281F" }}>
                  Invite friends to get more points.
                </CardTitle>
                <CardDescription className="mt-2">
                  Use your referral link below to unlock new mint levels.
                </CardDescription>
                <CardDescription className="mt-1">
                  You will earn <strong>500 points</strong> for each referred
                  friend + <strong>10%</strong> of their points!
                </CardDescription>
                <div className="flex w-full max-w-md items-center justify-start space-x-2 my-5">
                  <Input
                    id="link-input"
                    type="text"
                    defaultValue={`https://citizens.sproutmarketing.xyz/?ref=${userData?.invitation_code}`}
                    readOnly
                    className="text-center hover:bg-[#91A267] hover:text-background text-nuutext"
                    style={{ borderColor: "#8E6D50" }}
                  />
                  <Button
                    type="button"
                    onClick={copyToClipboard}
                    variant={"reflink"}
                  >
                    <Clipboard size={16} className="mr-2" />
                    {buttonText}
                  </Button>
                </div>
                <Button
                  size={"sm"}
                  variant={"specialAction"}
                  className="mr-2 mb-2 share:bg-[#1A281F] hover:bg-[#91A267]"
                  onClick={shareOnTwitter}
                >
                  <Image
                    src="/images/twitter.png"
                    alt="twitter"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Share on Twitter
                </Button>
                <Button
                  size={"sm"}
                  variant={"specialAction"}
                  className="share:bg-[#1A281F] hover:bg-[#91A267]"
                  onClick={shareOnTelegram}
                >
                  <Image
                    src="/images/telegram.png"
                    alt="Telegram"
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  Share on Telegram
                </Button>
              </div>

              {userData && (
                <div className="rounded-[2em] p-4 bg-[#F1EFE7] border border-border flex flex-col items-center gap-2">
                  <h1 className="font-bold text-2xl text-nuutext">
                    Level{" "}
                    {userData?.total_points < 5000
                      ? 0
                      : userData.total_points >= 5000 &&
                        userData.total_points < 20000
                      ? 1
                      : userData.total_points >= 20000 &&
                        userData.total_points < 50000
                      ? 2
                      : userData.total_points >= 50000
                      ? 3
                      : 0}
                  </h1>
                  <div className="flex gap-2 bg-[#020817] py-1 px-2 rounded-full">
                    <button
                      className={`w-[90px] py-2 rounded-full ${
                        userData.total_points >= 5000 &&
                        userData.total_points < 20000
                          ? "bg-[#5F7C23]"
                          : "bg-[#91A267]"
                      }`}
                    >
                      Seed
                    </button>
                    <button
                      className={`w-[90px] py-2 rounded-full ${
                        userData.total_points >= 20000 &&
                        userData.total_points < 50000
                          ? "bg-[#5F7C23]"
                          : "bg-[#91A267]"
                      }`}
                    >
                      Sprout
                    </button>
                    <button
                      className={`w-[90px] py-2 rounded-full ${
                        userData.total_points >= 50000
                          ? "bg-[#5F7C23]"
                          : "bg-[#91A267]"
                      }`}
                    >
                      Sapling
                    </button>
                  </div>
                  <p className="text-nuutext">
                    {userData.total_points < 5000
                    ? `${5000 - userData.total_points} points left to the next level`
                    : userData.total_points < 20000
                    ? `${20000 - userData.total_points} points left to the next level`
                    : userData.total_points < 50000
                    ? `${50000 - userData.total_points} points left to the next level`
                    : "Claim OG in Discord"}
                  </p>
                </div>
              )}
            </div>
            <div className="md:col-span-2 md:row-start-2 col-start-1 row-start-3 ">
              <div>
                <CardTitle className="mt-16" style={{ color: "#1A281F" }}>
                    Earn bonus points from the tasks below!
                </CardTitle>
                <Table className="w-full mt-4">
                  <TableHeader>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableHead className="w-16"></TableHead>
                      <TableHead>TASK</TableHead>
                      <TableHead>POINTS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableCell>
                        <Checkbox className="w-5 h-5 rounded-[4px]" checked />
                      </TableCell>
                      <TableCell>
                        Sign up for the waitlist with Twitter
                      </TableCell>
                      <TableCell>+100 points</TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          onClick={(e) => e.preventDefault()}
                          checked={isTwitterFollowed}
                        />
                      </TableCell>
                      <TableCell>
                        <TwitterButton
                          isDisabled={isTwitterFollowed}
                          onFollowSuccess={refreshTwitterFollowStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm ${
                            isTwitterFollowed ? "text-nuutext" : "text-nuutext"
                          } hover:text-background`}
                        >
                          + 100 points
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          onClick={(e) => e.preventDefault()}
                          checked={isTwitterIIFollowed}
                        />
                      </TableCell>
                      <TableCell>
                        <TwitterIIButton
                          isDisabled={isTwitterIIFollowed}
                          onFollowSuccess={refreshTwitterIIFollowStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm ${
                            isTwitterIIFollowed
                              ? "text-nuutext"
                              : "text-nuutext"
                          } hover:text-background`}
                        >
                          + 100 points
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          onClick={(e) => e.preventDefault()}
                          checked={isTwitterIIIFollowed}
                        />
                      </TableCell>
                      <TableCell>
                        <TwitterIIIButton
                          isDisabled={isTwitterIIIFollowed}
                          onFollowSuccess={refreshTwitterIIIFollowStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm ${
                            isTwitterIIIFollowed
                              ? "text-nuutext"
                              : "text-nuutext"
                          } hover:text-background`}
                        >
                          + 100 points
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          onClick={(e) => e.preventDefault()}
                          checked={isDiscordJoined}
                        />
                      </TableCell>
                      <TableCell>
                        <DiscordButton
                          isDisabled={isDiscordJoined}
                          onFollowSuccess={refreshDiscordJoinStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm ${
                            isDiscordJoined ? "text-nuutext" : "text-nuutext"
                          } hover:text-background`}
                        >
                          + 100 points
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          onClick={(e) => e.preventDefault()}
                          checked={isTelegramIIJoined}
                        />
                      </TableCell>
                      <TableCell>
                        <TelegramIIButton
                          isDisabled={isTelegramIIJoined}
                          onFollowSuccess={refreshTelegramFollowStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm ${
                            isTelegramIIJoined ? "text-nuutext" : "text-nuutext"
                          } hover:text-background`}
                        >
                          + 100 points
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-[#91A267]">
                      <TableCell>
                        <Checkbox
                          className="w-5 h-5 rounded-[4px]"
                          checked={isMetaMaskConnected}
                          onClick={(e) => e.preventDefault()}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          className="text-foreground p-4 text-center rounded-lg font-bold text-sm flex items-center justify-center"
                          onClick={() => connectMetaMask()}
                          disabled={isMetaMaskConnected}
                          variant={"specialAction"}
                        >
                          <Image
                            src="/images/metamask_logo.png"
                            alt="MetaMask Wallet"
                            width={24}
                            height={24}
                            className="mr-2"
                          />
                          <span>Connect MetaMask Wallet</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`text-sm ${
                            isMetaMaskConnected
                              ? "text-nuutext"
                              : "text-nuutext"
                          } hover:text-background`}
                        >
                          + 200 points
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="hidden md:block md:py-6">
            <CardTitle className="px-4 pb-4" style={{ color: "#1A281F" }}>
              You have earned {userPointsTotal} points 🎉
            </CardTitle>
            <CardDescription className="px-4 pb-4">
              Total referrals: {userData?.invited_accounts_count}
            </CardDescription>
            <Separator className="mt-2" />
            <Table className="w-full">
              <TableHeader>
                <TableRow className="hover:bg-[#91A267]">
                  <TableHead>Points</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsList?.slice(0, 20)?.map((point, index) => (
                  <TableRow key={index} className="hover:bg-[#91A267]">
                    <TableCell>{point.amount}</TableCell>
                    <TableCell>{point.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
