"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type LeaderboardEntry = {
    id: string;
    user: string;
    invitedCount: number;
    points: number;
  };
  
const ITEMS_PER_PAGE = 50;

const supabase = createClient();


export default function LeaderboardTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userPosition, setUserPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        setLoggedInUser(userData.user);

        const { count } = await supabase
          .from("accounts")
          .select("*", { count: "exact" });
        setTotalUsers(count || 0);

        const { data: positionData, error: positionError } = await supabase
          .from("accounts")
          .select("id, total_points")
          .order("total_points", { ascending: false });
        if (positionError) {
        console.error("Error fetching user position:", positionError);
        return;
        }
        const userPositionIndex = positionData.findIndex(
          (entry) => entry.id === userData.user?.id
        );
        setUserPosition(userPositionIndex >= 0 ? userPositionIndex + 1 : 0);

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const { data: pageData, error: pageDataError } = await supabase
          .from("accounts")
          .select("id, twitter_handle, total_points, invited_accounts_count")
          .order("total_points", { ascending: false })
          .range(startIndex, startIndex + ITEMS_PER_PAGE - 1);
        if (pageDataError) {
            console.error("Error fetching leaderboard page data:", pageDataError);
            return;
        }
        setLeaderboardData(
          pageData.map((entry) => ({
            id: entry.id,
            user: entry.twitter_handle,
            invitedCount: entry.invited_accounts_count,
            points: entry.total_points,
          }))
        );
      } catch (error) {
        alert("Error fetching leaderboard data. Try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [currentPage]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardContent>
        <CardTitle className="text-center">Your Position: {userPosition}/{totalUsers}</CardTitle>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Place</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Invited</TableCell>
              <TableCell>Points</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry, index) => (
              <TableRow
                key={entry.id}
                className={entry.id === loggedInUser?.id ? "bg-highlight" : ""}
              >
                <TableCell>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                <TableCell>{entry.user}</TableCell>
                <TableCell>{entry.invitedCount}</TableCell>
                <TableCell>{entry.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
