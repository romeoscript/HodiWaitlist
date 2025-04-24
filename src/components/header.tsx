"use client";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Header() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(data.user);
    });
  }, [supabase.auth]);

  function signOut() {
    supabase.auth.signOut().then(() => {
      window.location.href = "/enter";
    });
  }

  if (!user) {
    return null;
  }

  return (
    <header>
      <div className="absolute top-0 left-0 p-8">
        <div className="flex items-center space-x-4">
          <img
            src="/images/Sprout-Logo.png"
            className="w-20 h-20 rounded-full mt-[-1.2em] ml-[-0.6em] lg:mt-0 lg:ml-0"
          />
        </div>
      </div>
      <div className="absolute top-0 right-0 p-8">
        <div className="flex items-center space-x-4">
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name}
            className="w-8 h-8 rounded-full"
          />
          <strong style={{ color: "#1A281F" }}>
            @{user.user_metadata.preferred_username}
          </strong>
          <button
            className="text-sm underline underline-offset-4"
            onClick={signOut}
            style={{ color: "#1A281F" }}
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
