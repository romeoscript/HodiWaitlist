import EnterWaitlistBtn from "@/components/enter-waitlist-btn";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import WaitlistEntrance from "@/components/waitlist-entrance";
import Image from "next/image";

type Props = {};

export default function Home() {
  return (
    <>
      <WaitlistEntrance />
    </>
  );
}
