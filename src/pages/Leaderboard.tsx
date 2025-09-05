import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award } from "lucide-react";
import { getLeaderboard } from "@/queries/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Leaderboard = () => {
  const { data: teams, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  const getPositionIcon = (position: number | null) => {
    if (position === null) return <span className="text-muted-foreground">-</span>;
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-bold">{position}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          Current standings and team rankings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Team Rankings</CardTitle>
            <CardDescription>
              Live leaderboard based on all competition results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Total Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-center">
                        <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : teams && teams.length > 0 ? (
                  teams.map((team) => (
                    <TableRow key={team.team_id}>
                      <TableCell className="w-[80px] font-medium">
                        <div className="flex items-center justify-center">
                          {getPositionIcon(team.rank)}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {team.team_name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {team.total_points} points
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results have been entered yet. The leaderboard will
                      appear here once scores are recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Junior Category</CardTitle>
              <CardDescription>
                Rankings for junior participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Category-wise rankings coming soon...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Senior Category</CardTitle>
              <CardDescription>
                Rankings for senior participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Category-wise rankings coming soon...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Super Senior Category</CardTitle>
              <CardDescription>
                Rankings for super senior participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Category-wise rankings coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
