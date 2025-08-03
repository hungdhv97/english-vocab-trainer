import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function TodayReview() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Today's Review</CardTitle>
          <CardDescription>Review the words for today.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the today's review page. You will be able to review your words here.</p>
        </CardContent>
        <CardFooter>
          <p>Footer</p>
        </CardFooter>
      </Card>
    </div>
  )
}