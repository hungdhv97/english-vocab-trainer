import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Words() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Words</CardTitle>
          <CardDescription>Manage your vocabulary.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the words page. You will be able to add, edit, and delete words here.</p>
        </CardContent>
        <CardFooter>
          <p>Footer</p>
        </CardFooter>
      </Card>
    </div>
  )
}