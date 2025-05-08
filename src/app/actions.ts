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

const HODI_POINT_TIERS = [
  { min: 0, max: 24999, points: 0 },
  { min: 25000, max: 74999, points: 750 },
  { min: 75000, max: 249999, points: 2000 },
  { min: 250000, max: 499999, points: 5000 },
  { min: 500000, max: 1249999, points: 10000 },
  { min: 1250000, max: 2499999, points: 20000 },
  { min: 2500000, max: Infinity, points: 50000 }
];



// Helper function to get the tier for a specific balance
export async function getBalanceTier(balance: number) {
  for (const tier of HODI_POINT_TIERS) {
    if (balance >= tier.min && balance <= tier.max) {
      return tier;
    }
  }
  return HODI_POINT_TIERS[0]; // Default to first tier if not found
}

// Fixed server action that handles decimal values
export async function calculateIncrementalPoints(previousBalance: number, currentBalance: number) {
  // If balance decreased, no new points
  if (currentBalance <= previousBalance) {
    return 0;
  }

  // Get the tiers for both balances
  const previousTier = await getBalanceTier(previousBalance);
  const currentTier = await getBalanceTier(currentBalance);

  // Case 1: Stayed in the same tier
  if (previousTier === currentTier) {
    return 0; // No new points if staying in same tier
  }

  // Case 2: Moved up one or more tiers
  // We need to calculate points for each tier crossed
  let totalPoints = 0;
  let currentTierIndex = HODI_POINT_TIERS.indexOf(currentTier);
  let previousTierIndex = HODI_POINT_TIERS.indexOf(previousTier);

  // For each tier crossed, add the difference in points
  for (let i = previousTierIndex + 1; i <= currentTierIndex; i++) {
    const tierPoints = HODI_POINT_TIERS[i].points;
    const previousTierPoints = HODI_POINT_TIERS[i - 1].points;
    totalPoints += tierPoints - previousTierPoints;
  }

  return totalPoints;
}

// Updated function that handles decimals by converting to string
export async function updateWalletBalance(accountId: string, newBalance: number) {
  // Fetch the user's current account info
  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("last_token_balance, total_points")
    .eq("id", accountId)
    .single();

  if (fetchError) {
    console.error("Error fetching account:", fetchError);
    return false;
  }

  // For database storage, store as string instead of numeric value
  const balanceAsString = newBalance.toString();
  
  // For point calculations, use numeric value
  const previousBalance = parseFloat(existingAccount.last_token_balance || "0");
  const incrementalPoints = await calculateIncrementalPoints(previousBalance, newBalance);

  // Only proceed if there are new points to award
  if (incrementalPoints > 0) {
    // Update the account with new balance and additional points
    const { error: updateError } = await serviceSupabase
      .from("accounts")
      .update({
        last_token_balance: balanceAsString,
        total_points: existingAccount.total_points + incrementalPoints
      })
      .eq("id", accountId);

    if (updateError) {
      console.error("Error updating account balance and points:", updateError);
      return false;
    }

    // Record the points transaction
    const { error: pointsInsertError } = await serviceSupabase
      .from("points")
      .insert({
        account_id: accountId,
        amount: incrementalPoints,
        note: `HODI Token Balance Increase (${previousBalance.toLocaleString()} → ${newBalance.toLocaleString()})`,
      });

    if (pointsInsertError) {
      console.error("Error inserting points record:", pointsInsertError);
      // Points added to account but record failed - not critical
    }

    return {
      success: true,
      pointsAwarded: incrementalPoints,
      newTotalPoints: existingAccount.total_points + incrementalPoints
    };
  }

  // Balance increased but not enough to change tiers, or balance decreased
  // Just update the stored balance
  const { error: updateBalanceError } = await serviceSupabase
    .from("accounts")
    .update({ last_token_balance: balanceAsString })
    .eq("id", accountId);

  if (updateBalanceError) {
    console.error("Error updating account balance:", updateBalanceError);
    return false;
  }

  return {
    success: true,
    pointsAwarded: 0,
    newTotalPoints: existingAccount.total_points
  };
}

// Fixed savePrincipalId function to handle decimals
export async function savePrincipalId(principalId: string, initialBalance: number = 0) {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  // Fetch existing account
  const { data: existingAccount, error: fetchError } = await serviceSupabase
    .from("accounts")
    .select("principal_id, invited_by_account_id, total_points")
    .eq("id", user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching account", fetchError);
    return false;
  }

  // CRITICAL CHECK: If principal ID is already set, don't continue the process
  if (existingAccount.principal_id) {
    console.log("Principal ID already set, skipping connection and points award");
    return true; // Return success but don't add points
  }

  // Calculate points to award based on HODI holdings
  const tier = await getBalanceTier(initialBalance);
  const pointsToAward = tier.points > 0 ? tier.points : PLUG_WALLET_POINTS;

  // Convert balance to string for storage
  const balanceAsString = initialBalance.toString();

  // Update account with the principal ID, awarded points, and initial balance
  const { error: updateError } = await serviceSupabase
    .from("accounts")
    .update({ 
      principal_id: principalId, 
      total_points: existingAccount.total_points + pointsToAward,
      last_token_balance: balanceAsString
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating account with principalId", updateError);
    return false;
  }

  // Add points record
  const note = tier.points > 0 
    ? `Connected wallet with ${initialBalance.toLocaleString()} HODI (${tier.points} points)` 
    : "MetaMask Wallet Connection";

  const { error: pointsInsertError } = await serviceSupabase
    .from("points")
    .insert({
      account_id: user.id,
      amount: pointsToAward,
      note: note,
    });

  if (pointsInsertError) {
    console.error("Error inserting points", pointsInsertError);
    return false;
  }

  // Award referrer points if applicable
  if (existingAccount.invited_by_account_id) {
    const { data: invitingAccount, error: fetchInvitingError } = await serviceSupabase
      .from("accounts")
      .select("total_points")
      .eq("id", existingAccount.invited_by_account_id)
      .single();

    if (!fetchInvitingError && invitingAccount) {
      // Calculate referrer bonus (10% of points)
      const referrerBonus = Math.floor(pointsToAward / 10);
      
      // Add points to referrer
      const { error: increaseInviterPointsError } = await serviceSupabase
        .from("accounts")
        .update({
          total_points: invitingAccount.total_points + referrerBonus,
        })
        .eq("id", existingAccount.invited_by_account_id);

      // Record the referrer bonus
      await serviceSupabase
        .from("points")
        .insert({
          account_id: existingAccount.invited_by_account_id,
          amount: referrerBonus,
          note: "Referral HODI Holdings Bonus",
        });
    }
  }

  return true;
}

export async function fetchTwitterFollowed() {
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

export async function fetchTwitterIIFollowed() {
  const { user, error } = await getAuthenticatedUser();
  if (error || !user) return null;

  const { data, error: fetchError } = await serviceSupabase
    .from("points")
    .select("note")
    .eq("account_id", user.id)
    .eq("note", "Subscribe to our youtube channel");

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
    .eq("note", "Follow Kev the Dev on X");

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
      note: "Subscribe to our youtube channel",
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
        note: "Subscribe to our youtube channel",
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
      note: "Follow Kev the Dev on X",
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