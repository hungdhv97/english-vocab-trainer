import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function History() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>View your review history.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the history page. You will be able to see your review history here.</p>
        </CardContent>
        <CardFooter>
          <p>Footer</p>
        </CardFooter>
      </Card>
    </div>
  )
}