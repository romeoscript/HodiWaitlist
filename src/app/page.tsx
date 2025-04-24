"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import WaitlistEntrance from "@/components/waitlist-entrance";
import InvitationCode from "@/components/invitation-code";
import { fetchAccount } from "./actions";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;

        const existingAccount = await fetchAccount();
        setUserExists(!!existingAccount);
        setHasAccount(!!user);

        if (existingAccount) {
          router.push("/dashboard");
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking user or account", error);
        setIsLoading(false);
      }
    };

    checkUserAndRedirect();

    const loadInviteCode = () => {
      const urlCode = searchParams.get("ref");
      if (urlCode) {
        window.localStorage.setItem("inviteCode", urlCode);
        setInviteCode(urlCode);
      } else {
        const localStorageItem = window.localStorage.getItem("inviteCode");

        if (localStorageItem) {
          setInviteCode(localStorageItem);
        }
      }
    };

    loadInviteCode();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-points"></div>
    );
  }

  if (!hasAccount) {
    return <WaitlistEntrance />;
  }

  if (hasAccount && !userExists) {
    return (
      <InvitationCode
        isLoading={isLoading}
        code={inviteCode}
        setCode={setInviteCode}
      />
    );
  }

  return <div>Something went wrong. Please try reloading the page.</div>;
}
