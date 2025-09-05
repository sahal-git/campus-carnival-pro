import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Trophy, Crown } from "lucide-react"

const Index = () => {
  const stats = [
    { title: "Total Teams", value: "8", icon: Crown, color: "text-blue-600" },
    { title: "Registered Students", value: "240", icon: Users, color: "text-green-600" },
    { title: "Total Programs", value: "24", icon: Calendar, color: "text-purple-600" },
    { title: "Completed Events", value: "12", icon: Trophy, color: "text-orange-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Fest Management System</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">New student registered</span>
                <Badge variant="secondary">Just now</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Dance competition results updated</span>
                <Badge variant="secondary">2 mins ago</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Team Blue won football match</span>
                <Badge variant="secondary">5 mins ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Teams</CardTitle>
            <CardDescription>Current leaderboard snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">🥇 Red Team</span>
                <Badge>150 points</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">🥈 Blue Team</span>
                <Badge variant="secondary">135 points</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">🥉 Green Team</span>
                <Badge variant="secondary">120 points</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
