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
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent py-3">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4">
        <div className="flex items-center space-x-4">
          <img
            src="/images/Sprout-Logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-full"
          />
        </div>
        <div className="flex items-center space-x-4">
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name}
            className="w-8 h-8 rounded-full border-2 border-hodi-yellow"
          />
          <strong className="text-white hidden sm:block">
            @{user.user_metadata.preferred_username}
          </strong>
          <button
            className="text-sm text-white hover:text-hodi-yellow transition-colors"
            onClick={signOut}
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
