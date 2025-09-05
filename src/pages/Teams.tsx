import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const Teams = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage fest teams and their members</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Create and manage teams for the fest competition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Team management features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Teams