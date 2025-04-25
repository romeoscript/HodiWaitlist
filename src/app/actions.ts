//action.ts

"use server";

import { createClient } from "@/utils/supabase/server";
import { serviceSupabase } from "@/utils/supabase/service";
import { SupabaseClient } from "@supabase/supabase-js";

const SIGN_UP_POINTS = 100;
const SIGN_UP_ARES_POINTS = 20000;
const SIGN_UP_HCANFT_POINTS = 1000;
const SIGN_UP_SULTAN_POINTS = 5000;
const SIGN_UP_CHRIS_POINTS = 20000;
const SIGN_UP_BLEVER_POINTS = 20000;
const REFERRAL_POINTS = 500;
const PLUG_WALLET_POINTS = 200;
const TWITTER_FOLLOW_POINTS = 100;
const DISCORD_JOIN_POINTS = 100;
const SIGN_UP_KODAMA_POINTS = 5000;
const SIGN_UP_LOSHMI_POINTS = 20000;

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData || !userData.user) {
    console.error("User is not authenticated", userError);
    return { user: null, error: userError };
  }

  return { user: userData.user, error: null };
}

export async function fetchAccount() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: accountData, error: accountError } = await serviceSupabase
    .from("accounts")
    .select("*")
    .eq("id", user.id);

  if (accountError || !accountData || !accountData[0]) {
    return null;
  }

  return accountData[0];
}

export async function fetchbanedAccount() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: accountData, error: accountError } = await serviceSupabase
    .from("blacklistedacc")
    .select("*")
    .eq("email", user.email);

  if (accountError || !accountData || !accountData[0]) {
    return null;
  }

  return accountData[0];
}

export async function claimCode(code: string) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingAccount = await fetchAccount();

  if (existingAccount) {
    console.error("Account already exists");
    return null;
  }

  const BlacklistAccount = await fetchbanedAccount();

  if (BlacklistAccount) {
    console.error("This Account is Banned!");
    return false;
  }

  const { data: invitorAccountData, error: accountError } =
    await serviceSupabase
      .from("accounts")
      .select("*")
      .eq("invitation_code", code);

  if (accountError || !invitorAccountData || !invitorAccountData[0]) {
    console.error("No account found with that code");
    return false;
  }

  const signUpPoints =
    code === "ares10" ? SIGN_UP_ARES_POINTS 
    : code === "HCANFT" ? SIGN_UP_HCANFT_POINTS 
    : code === "kodama" ? SIGN_UP_KODAMA_POINTS 
    : code === "SULTAN" ? SIGN_UP_SULTAN_POINTS 
    : code === "e38502" ? SIGN_UP_ARES_POINTS 
    : code === "881711" ? SIGN_UP_CHRIS_POINTS 
    : code === "heroes" ? SIGN_UP_ARES_POINTS
    : code === "blever" ? SIGN_UP_BLEVER_POINTS
    : code === "lambss" ? SIGN_UP_ARES_POINTS
    : code === "lgtdao" ? SIGN_UP_ARES_POINTS
    : code === "gana10" ? SIGN_UP_ARES_POINTS
    : code === "mira10" ? SIGN_UP_CHRIS_POINTS
    : code === "zaimir" ? SIGN_UP_CHRIS_POINTS
    : code === "loshmi" ? SIGN_UP_LOSHMI_POINTS
    : code === "reikoo" ? SIGN_UP_ARES_POINTS
    : code === "mic100" ? SIGN_UP_ARES_POINTS
    : code === "NFTNFT" ? SIGN_UP_ARES_POINTS
    : code === "ronnie" ? SIGN_UP_ARES_POINTS
    : SIGN_UP_POINTS;

  const { error: createAccountError } = await serviceSupabase
    .from("accounts")
    .insert({
      id: user.id,
      invited_by_account_id: invitorAccountData[0].id,
      email: user.email,
      twitter_handle: "@" + user.user_metadata.preferred_username,
      total_points: signUpPoints,
    });

  if (createAccountError) {
    console.error("Error inserting account", createAccountError);
    return false;
  }

  const { error: pointsAddError } = await serviceSupabase
    .from("accounts")
    .update(
      { invited_accounts_count: invitorAccountData[0].invited_accounts_count + 1, total_points: invitorAccountData[0].total_points + REFERRAL_POINTS},
    )
    .eq("invitation_code", code);
  
  if (pointsAddError) {
    console.error("Error Adding points", pointsAddError);
    return false;
  }

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert([
      { account_id: user.id, amount: signUpPoints, note: "Sign Up" },
      {
        account_id: invitorAccountData[0].id,
        amount: REFERRAL_POINTS,
        note: `Referral of ${"@" + user.user_metadata.preferred_username}`,
      },
    ]);

  if (pointsInsertError) {
    console.error("Error inserting points", pointsInsertError);
    return false;
  }

  return true;
}

export async function fetchPrincipalId() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching principalId", error);
    return;
  }

  if (data && data.principal_id) {
    return true;
  }
}

export async function savePrincipalId(principalId: string) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching account", fetchError);
    return false;
  }

  const { error: updateError } = await serviceSupabase
    .from("accounts")
    .update({ principal_id: principalId, total_points: existingAccount.total_points + PLUG_WALLET_POINTS})
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating account with principalId", updateError);
    return false;
  }

  if (!existingAccount.principal_id) {
    const { error: pointsInsertError } = await serviceSupabase
      .from("points")
      .insert({
        account_id: user.id,
        amount: PLUG_WALLET_POINTS,
        note: "MetaMask Wallet Connection",
      });

    if (pointsInsertError) {
      console.error(
        "Error inserting points for MetaMask Wallet connection",
        pointsInsertError
      );
      return false;
    }

    if (existingAccount.invited_by_account_id) {
      const { error: inviterPointsError } = await serviceSupabase
        .from("points")
        .insert({
          account_id: existingAccount.invited_by_account_id,
          amount: PLUG_WALLET_POINTS / 10,
          note: "Referral MetaMask Wallet Connection",
        });
    }
  }

  const { data: invitingAccount, error: fetchinvitingError } = await serviceSupabase
  .from("accounts")
  .select("total_points")
  .eq("id", existingAccount.invited_by_account_id)
  .single();


 const { error: increaseInviterPointsError } = await serviceSupabase
  .from("accounts")
  .update({
    total_points: invitingAccount?.total_points + PLUG_WALLET_POINTS/10,
  })
  .eq("id", existingAccount.invited_by_account_id);

  return true;
}

export async function fetchTwitterFollowed() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Follow Sprout Citizens on Twitter");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function fetchTwitterIIFollowed() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Follow $HODI on Twitter");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function fetchTwitterIIIFollowed() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Follow Cat Cartel on Twitter");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function twitterPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingFollow = await fetchTwitterFollowed();

  if (existingFollow) {
    console.log("Points for Twitter follow already added");
    return false;
  }
  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();
  
    if (fetchError) {
      console.error(
        "Error fetching account for Twitter follow",
        fetchError
      );
      return false;
    }

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: TWITTER_FOLLOW_POINTS,
      note: "Follow $HODI on Twitter",
    });

  const { error: increasePointsError } = await serviceSupabase
    .from("accounts")
    .update({
      total_points: existingAccount.total_points + TWITTER_FOLLOW_POINTS,
    })
    .eq("id", user.id);

  if (pointsInsertError || increasePointsError) {
    console.error(
      "Error inserting points for Twitter follow",
      pointsInsertError
    );
    return false;
  }

  if (existingAccount?.invited_by_account_id) {
    const { error: inviterPointsError } = await serviceSupabase
      .from("points")
      .insert({
        account_id: existingAccount.invited_by_account_id,
        amount: TWITTER_FOLLOW_POINTS / 10,
        note: "Referral Twitter Follow",
      });
  }

  const { data: invitingAccount, error: fetchinvitingError } = await serviceSupabase
  .from("accounts")
  .select("total_points")
  .eq("id", existingAccount.invited_by_account_id)
  .single();


 const { error: increaseInviterPointsError } = await serviceSupabase
  .from("accounts")
  .update({
    total_points: invitingAccount?.total_points + TWITTER_FOLLOW_POINTS/10,
  })
  .eq("id", existingAccount.invited_by_account_id);

  return true;
}

export async function twitterIIPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingFollow = await fetchTwitterIIFollowed();

  if (existingFollow) {
    console.log("Points for Twitter follow already added");
    return false;
  }
  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();

    if (fetchError) {
      console.error(
        "Error fetching account for Twitter follow",
        fetchError
      );
      return false;
    }

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: TWITTER_FOLLOW_POINTS,
      note: "Follow Cat Cartel on Twitter",
    });
  
    const { error: increasePointsError } = await serviceSupabase
    .from("accounts")
    .update({
      total_points: existingAccount.total_points + TWITTER_FOLLOW_POINTS,
    })
    .eq("id", user.id);


  if (pointsInsertError || increasePointsError) {
    console.error(
      "Error inserting points for Twitter follow",
      pointsInsertError
    );
    return false;
  }

  if (existingAccount?.invited_by_account_id) {
    const { error: inviterPointsError } = await serviceSupabase
      .from("points")
      .insert({
        account_id: existingAccount.invited_by_account_id,
        amount: TWITTER_FOLLOW_POINTS / 10,
        note: "Referral Twitter Follow",
      });
  }

  const { data: invitingAccount, error: fetchinvitingError } = await serviceSupabase
  .from("accounts")
  .select("total_points")
  .eq("id", existingAccount.invited_by_account_id)
  .single();


 const { error: increaseInviterPointsError } = await serviceSupabase
  .from("accounts")
  .update({
    total_points: invitingAccount?.total_points + TWITTER_FOLLOW_POINTS/10,
  })
  .eq("id", existingAccount.invited_by_account_id);

  return true;
}

export async function twitterIIIPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingFollow = await fetchTwitterIIIFollowed();

  if (existingFollow) {
    console.log("Points for Twitter follow already added");
    return false;
  }
  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();

    if (fetchError) {
      console.error(
        "Error fetching account for Twitter follow",
        fetchError
      );
      return false;
    }

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: TWITTER_FOLLOW_POINTS,
      note: "Follow Cat Cartel on Twitter",
    });
  
    const { error: increasePointsError } = await serviceSupabase
    .from("accounts")
    .update({
      total_points: existingAccount.total_points + TWITTER_FOLLOW_POINTS,
    })
    .eq("id", user.id);


  if (pointsInsertError) {
    console.error(
      "Error inserting points for Twitter follow",
      pointsInsertError
    );
    return false;
  }

  if (existingAccount?.invited_by_account_id) {
    const { error: inviterPointsError } = await serviceSupabase
      .from("points")
      .insert({
        account_id: existingAccount.invited_by_account_id,
        amount: TWITTER_FOLLOW_POINTS / 10,
        note: "Referral Twitter Follow",
      });
  }

  const { data: invitingAccount, error: fetchinvitingError } = await serviceSupabase
  .from("accounts")
  .select("total_points")
  .eq("id", existingAccount.invited_by_account_id)
  .single();


 const { error: increaseInviterPointsError } = await serviceSupabase
  .from("accounts")
  .update({
    total_points: invitingAccount?.total_points + TWITTER_FOLLOW_POINTS/10,
  })
  .eq("id", existingAccount.invited_by_account_id);

  return true;
}

export async function fetchDiscordJoined() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Joined Discord Cat Cartel");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function discordPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingJoin = await fetchDiscordJoined();

  if (existingJoin) {
    console.log("Points for Discord join already added");
    return false;
  }

  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();

    if (fetchError) {
      console.error(
        "Error fetching account for Twitter follow",
        fetchError
      );
      return false;
    }
  
  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: DISCORD_JOIN_POINTS,
      note: "Joined Discord Cat Cartel",
    });

    const { error: increasePointsError } = await serviceSupabase
    .from("accounts")
    .update({
      total_points: existingAccount.total_points + DISCORD_JOIN_POINTS,
    })
    .eq("id", user.id);


  if (pointsInsertError) {
    console.error("Error inserting points for Discord join", pointsInsertError);
    return false;
  }

  if (existingAccount?.invited_by_account_id) {
     const { error: inviterPointsError } = await serviceSupabase
       .from("points")
       .insert({
         account_id: existingAccount.invited_by_account_id,
         amount: DISCORD_JOIN_POINTS / 10,
         note: "Referral Discord Join",
       });
   }
  
  const { data: invitingAccount, error: fetchinvitingError } = await serviceSupabase
   .from("accounts")
   .select("total_points")
   .eq("id", existingAccount.invited_by_account_id)
   .single();


  const { error: increaseInviterPointsError } = await serviceSupabase
   .from("accounts")
   .update({
     total_points: invitingAccount?.total_points + DISCORD_JOIN_POINTS/10,
   })
   .eq("id", existingAccount.invited_by_account_id);

  return true;
}

export async function fetchTelegramJoined() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Joined Telegram Community");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function TelegramPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingJoin = await fetchTelegramJoined();

  if (existingJoin) {
    console.log("Points for Telegram join already added");
    return false;
  }

  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();
  
    if (fetchError) {
      console.error(
        "Error fetching account for Twitter follow",
        fetchError
      );
      return false;
    }

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: DISCORD_JOIN_POINTS,
      note: "Joined Telegram Community",
    });

    const { error: increasePointsError } = await serviceSupabase
    .from("accounts")
    .update({
      total_points: existingAccount.total_points + DISCORD_JOIN_POINTS,
    })
    .eq("id", user.id);


  if (pointsInsertError) {
    console.error("Error inserting points for Telegram join", pointsInsertError);
    return false;
  }

  if (existingAccount?.invited_by_account_id) {
     const { error: inviterPointsError } = await serviceSupabase
       .from("points")
       .insert({
         account_id: existingAccount.invited_by_account_id,
         amount: DISCORD_JOIN_POINTS / 10,
         note: "Referral Telegram Join",
       });
   }
  
  const { data: invitingAccount, error: fetchinvitingError } = await serviceSupabase
   .from("accounts")
   .select("total_points")
   .eq("id", existingAccount.invited_by_account_id)
   .single();


  const { error: increaseInviterPointsError } = await serviceSupabase
   .from("accounts")
   .update({
     total_points: invitingAccount?.total_points + DISCORD_JOIN_POINTS/10,
   })
   .eq("id", existingAccount.invited_by_account_id);
  
  return true;
}

export async function fetchTelegramIIJoined() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Joined Telegram Channel");

  if (fetchError) {
    console.error("Error fetching note", error);
    return;
  }
  return data.length > 0;
}

export async function TelegramIIPoints() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const existingJoin = await fetchTelegramIIJoined();

  if (existingJoin) {
    console.log("Points for Telegram join already added");
    return false;
  }

  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();

    if (fetchError) {
      console.error(
        "Error fetching account for Twitter follow",
        fetchError
      );
      return false;
    }

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: DISCORD_JOIN_POINTS,
      note: "Joined Telegram Channel",
    });
  
    const { error: increasePointsError } = await serviceSupabase
    .from("accounts")
    .update({
      total_points: existingAccount.total_points + DISCORD_JOIN_POINTS,
    })
    .eq("id", user.id);


  if (pointsInsertError) {
    console.error("Error inserting points for Telegram join", pointsInsertError);
    return false;
  }

   if (existingAccount?.invited_by_account_id) {
     const { error: inviterPointsError } = await serviceSupabase
       .from("points")
       .insert({
         account_id: existingAccount.invited_by_account_id,
         amount: DISCORD_JOIN_POINTS / 10,
         note: "Referral Discord Join",
       });
   }

   const { data: invitingAccount, error: fetchinvitingError } = await serviceSupabase
   .from("accounts")
   .select("total_points")
   .eq("id", existingAccount.invited_by_account_id)
   .single();


   const { error: increaseInviterPointsError } = await serviceSupabase
   .from("accounts")
   .update({
     total_points: invitingAccount?.total_points + DISCORD_JOIN_POINTS/10,
   })
   .eq("id", existingAccount.invited_by_account_id);

  return true;
}

export async function fetchPointsList() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: pointsData, error: pointsError } = await serviceSupabase
    .from("points")
    .select("*")
    .eq("account_id", user.id);

  if (pointsError || !pointsData) {
    return null;
  }

  return pointsData;
}

export async function LeaderboardListCount() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: LeaderboardData, error: LeaderboardError, count } = await serviceSupabase
  .from("accounts")
  .select("id, twitter_handle, total_points, invited_accounts_count", {
    count: "estimated",
  })
  .neq("twitter_handle", "@sprout")
  .order("total_points", { ascending: false });

  if (LeaderboardError || !LeaderboardData) {
    return null;
  }
  // Update the total number of users
  const TotalUsers = count || 0;

  return TotalUsers;
}

export async function LeaderboardUserPosition() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: positionData, error: positionError } = await serviceSupabase
  .from("accounts")
  .select("total_points, id")
  .order("total_points", { ascending: false });

  if (positionError) {
    return null;
  }

  return positionData;
}

export async function LeaderboardPageData(startIndex: number, endIndex: number) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data: pageData, error: pageError} = await serviceSupabase
    .from("accounts")
    .select("id, twitter_handle, total_points, invited_accounts_count")
    .neq("twitter_handle", "@sprout")
    .order("total_points", { ascending: false })
    .range(startIndex, endIndex);
  if (pageError) {
    console.error("Error fetching leaderboard data:", pageError);
    return null;
  }

  return pageData;
}