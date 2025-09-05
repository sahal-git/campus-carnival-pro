import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const Students = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student registrations and assignments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Registration</CardTitle>
            <CardDescription>
              Register students with admission numbers, fest IDs, and team assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Student management features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Students