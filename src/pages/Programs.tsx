import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const Programs = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">Manage stage, non-stage, and sports events</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stage Programs</CardTitle>
            <CardDescription>
              Cultural performances and stage events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Dance, music, drama, and other stage performances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Non-Stage Programs</CardTitle>
            <CardDescription>
              Art, craft, and academic competitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Drawing, essay writing, quiz competitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sports Programs</CardTitle>
            <CardDescription>
              Athletic events and sports competitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Football, cricket, athletics, and indoor games</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Programs