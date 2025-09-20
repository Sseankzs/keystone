"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"

// Mock data for grant matches - following the new contract
const GRANT_MATCHES = [
  {
    grant_id: "mdv_2025_tech_upg",
    title: "MDV Tech Upgrade Grant",
    issuer: "MTEN",
    amount_max_myr: 500000,
    deadline: "2025-12-31",
    verdict: "likely",
    score: 87,
    why: "Matches 'digitalization'; headcount and age pass.",
    dealbreakers: [],
    tags: ["manufacturing", "digitalization"],
    checklist_ready_ratio: "2/5"
  },
  {
    grant_id: "sbg_growth_fund_2024",
    title: "Small Business Growth Fund",
    issuer: "Regional Development Agency",
    amount_max_myr: 100000,
    deadline: "2024-04-30",
    verdict: "mixed",
    score: 78,
    why: "Your expansion plans match fund objectives, but some requirements need attention.",
    dealbreakers: [],
    tags: ["growth", "scaling"],
    checklist_ready_ratio: "2/5"
  },
  {
    grant_id: "eu_digital_transformation",
    title: "Digital Transformation Initiative",
    issuer: "European Commission",
    amount_max_myr: 500000,
    deadline: "2024-05-20",
    verdict: "not_eligible",
    score: 65,
    why: "Tech relevant, but fails geographic requirement.",
    dealbreakers: ["EU presence required"],
    tags: ["digital", "international"],
    checklist_ready_ratio: "1/5"
  },
]

const getVerdictColor = (verdict: string) => {
  switch (verdict) {
    case "likely":
      return "bg-green-50 text-green-700 border-green-200"
    case "mixed":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "not_eligible":
      return "bg-red-50 text-red-700 border-red-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getVerdictIcon = (verdict: string) => {
  switch (verdict) {
    case "likely":
      return <CheckCircle className="h-4 w-4" />
    case "mixed":
      return <Clock className="h-4 w-4" />
    case "not_eligible":
      return <AlertCircle className="h-4 w-4" />
    default:
      return null
  }
}

const getVerdictText = (verdict: string) => {
  switch (verdict) {
    case "likely":
      return "Likely eligible"
    case "mixed":
      return "Mixed"
    case "not_eligible":
      return "Not eligible"
    default:
      return "Unknown"
  }
}

const formatAmount = (amount: number) => {
  return `RM ${amount.toLocaleString()}`
}

const formatDeadline = (deadline: string) => {
  const date = new Date(deadline)
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}


export default function ResultsPage() {
  const handleChatClick = (grantId: string) => {
    // Navigate to chat page for specific grant
    window.location.href = `/sme/chat/${grantId}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your Funding Matches</h1>
          <p className="text-sm text-gray-600">
            We found {GRANT_MATCHES.length} potential funding opportunities based on your goals and company profile.
          </p>
        </div>

        {/* Results - Information-dense cards optimized for scanning */}
        <div className="space-y-2">
          {GRANT_MATCHES.map((grant) => {
            return (
              <div key={grant.grant_id} className="bg-white rounded-lg shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="p-4">
                  {/* Header: Title + Verdict + Amount + Deadline in compact layout */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{grant.title}</h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getVerdictColor(grant.verdict)}`}>
                          {getVerdictIcon(grant.verdict)}
                          {getVerdictText(grant.verdict)} • {grant.score}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{grant.issuer}</span>
                        <span>•</span>
                        <span>Deadline {formatDeadline(grant.deadline)}</span>
                      </div>
                    </div>
                    {/* Amount prominently displayed on the right */}
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-black-600">{formatAmount(grant.amount_max_myr)}</div>
                      <div className="text-xs text-gray-500">Maximum Funding</div>
                    </div>
                  </div>

                  {/* Content row: Why + Dealbreakers + Tags + Checklist */}
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    {/* Why it matches */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Why:</span> {grant.why}
                      </p>
                    </div>

                    {/* Dealbreakers */}
                    {grant.dealbreakers.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {grant.dealbreakers.map((dealbreaker, index) => (
                          <div key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <AlertCircle className="h-3 w-3" />
                            {dealbreaker}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer: Tags + CTAs */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {grant.tags.slice(0, 3).map((tag) => (
                          <div
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                      
                    </div>

                    {/* CTAs */}
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-7 px-3">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs h-7 px-3"
                        onClick={() => handleChatClick(grant.grant_id)}
                      >
                        <MessageCircle className="mr-1 h-3 w-3" />
                        Ask AI
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Action Section */}
        <div className="mt-8 text-center">
          <Link href="/sme/dashboard">
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
