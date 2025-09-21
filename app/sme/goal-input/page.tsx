"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Building2, Target, Lightbulb, ArrowRight, Loader2 } from "lucide-react"

const EXAMPLE_GOALS = [
  "We need funding to expand our AI-powered customer service platform to new markets and hire 10 additional engineers.",
  "Looking for seed funding to develop our sustainable packaging solution and establish partnerships with major retailers.",
  "Seeking Series A funding to scale our fintech platform, enhance security features, and expand to European markets.",
  "Need growth capital to increase manufacturing capacity for our medical devices and obtain additional regulatory approvals.",
]

export default function GoalInputPage() {
  const router = useRouter()
  const [goal, setGoal] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim()) return

    setIsLoading(true)

    // TODO: Send goal to matching API
    console.log("Goal submitted:", goal)

    // Simulate API call for matching
    setTimeout(() => {
      setIsLoading(false)
      router.push("/sme/results")
    }, 2000)
  }

  const handleExampleClick = (example: string) => {
    setGoal(example)
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-serif">Keystone</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">What are your funding goals?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Describe what you want to achieve with funding. Be specific about your plans, timeline, and expected
            outcomes. This helps us find the most relevant grants and funding opportunities.
          </p>
        </div>

        {/* Main Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Describe Your Funding Goals
            </CardTitle>
            <CardDescription>
              Tell us about your specific plans, what you want to accomplish, and how the funding will be used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal">Your Funding Goals *</Label>
                <Textarea
                  id="goal"
                  placeholder="Example: We need $500k in Series A funding to expand our AI platform to new markets, hire 10 engineers, and develop mobile applications. We plan to achieve 100k users and $2M ARR within 18 months..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={8}
                  className="resize-none"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {goal.length}/1000 characters • Be specific about amounts, timeline, and expected outcomes
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={!goal.trim() || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Matches...
                  </>
                ) : (
                  <>
                    Find Funding Matches
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Examples Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-secondary" />
              Example Goals
            </CardTitle>
            <CardDescription>Click on any example to use it as a starting point for your own goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {EXAMPLE_GOALS.map((example, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleExampleClick(example)}
                >
                  <p className="text-sm text-muted-foreground">{example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
