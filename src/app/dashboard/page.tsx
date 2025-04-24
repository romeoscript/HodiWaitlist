"use server";
import Dashboard from "@/components/dashboard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { useState } from "react";
import { fetchAccount } from "../actions";

export default async function DashboardPage() {
  const supabase = createClient();
  const existingAccount = await fetchAccount();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data || !data.user) {
    redirect("/enter");
    return null;
  }

  if (!existingAccount) {
    redirect("/");
    return null;
  }

  return <Dashboard />;
}
