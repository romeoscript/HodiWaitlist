// custom-types.d.ts
declare global {
  interface Window {
    ic: {
      plug: {
        requestConnect: () => Promise<void>;
        principalId: () => string;
      };
    };
  }
  interface SupabaseUser {
    created_at: string;
    email: string;
    id: string;
    invitation_code: string;
    invited_accounts_count: number;
    invited_by_account_id: string;
    principal_id: string;
    total_points: number;
    twitter_handle: string;
  }
  interface PointList {
    id: number;
    created_at: string;
    account_id: string;
    amount: number;
    note: string;
  }
}

// Make sure the file is treated as a module if it contains only type declarations.
export {};
