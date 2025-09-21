"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChatWidget } from "@/components/chat-widget"
import { Building2, ArrowLeft } from "lucide-react"

// Mock grant data - in real app, this would be fetched based on grantId
const GRANT_DATA = {
  "1": {
    title: "Tech Innovation Grant 2024",
    provider: "Department of Innovation",
    amount: "$250,000",
  },
  "2": {
    title: "Small Business Growth Fund",
    provider: "Regional Development Agency",
    amount: "$100,000",
  },
  "3": {
    title: "Digital Transformation Initiative",
    provider: "European Commission",
    amount: "$500,000",
  },
}

export default function ChatPage() {
  const params = useParams()
  const grantId = params.grantId as string
  const grant = GRANT_DATA[grantId as keyof typeof GRANT_DATA]

  if (!grant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Grant Not Found</h1>
          <p className="text-muted-foreground mb-4">The grant you're looking for doesn't exist.</p>
          <Link href="/sme/results">
            <Button>Back to Results</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground font-serif">Keystone</span>
            </div>
            <Link href="/sme/results">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Results
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Grant Info Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">{grant.title}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span>{grant.provider}</span>
            <span>•</span>
            <span className="font-semibold text-primary">{grant.amount}</span>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] overflow-hidden">
            <ChatWidget grantId={grantId} grantTitle={grant.title} isOpen={true} />
          </Card>
        </div>

        {/* Help Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">What can you ask?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Eligibility & Requirements</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "What are the eligibility criteria?"</li>
                  <li>• "What documents do I need to submit?"</li>
                  <li>• "Do I qualify for this grant?"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Process & Timeline</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "When is the application deadline?"</li>
                  <li>• "How long does the review take?"</li>
                  <li>• "What happens after I apply?"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Funding Details</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "How much funding is available?"</li>
                  <li>• "What can I use the funds for?"</li>
                  <li>• "Are there any restrictions?"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Application Tips</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "How can I improve my application?"</li>
                  <li>• "What makes a strong proposal?"</li>
                  <li>• "Common mistakes to avoid?"</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
