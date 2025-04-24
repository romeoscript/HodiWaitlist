// src/utils/share.ts
import { createClient } from "@/utils/supabase/client";

export async function generateShareText(accountId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("accounts")
    .select("invitation_code")
    .eq("id", accountId);

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Account not found");

  const invitationCode = data[0].invitation_code;
  const refLink = `https://citizens.sproutmarketing.xyz/?ref=${invitationCode}`;

  return `I just signed up for the @beamit_ai waitlist!

  1. 3D avatars generated from your NFTs via AI 
  2. Monetize your IP via Token rewards
  3. Mint from any chain beamit into any metaverse

Use my referral code to join the waitlist & earn bonus points for an airdrop: ${refLink}`;
}
