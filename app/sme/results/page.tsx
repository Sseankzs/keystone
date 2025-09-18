"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Building2, MessageCircle, CheckCircle, Clock, AlertCircle, ExternalLink, ArrowLeft, Cpu, Lightbulb, Zap, TrendingUp, MapPin, Globe, Code, Target, Users, Briefcase } from "lucide-react"

// Mock data for grant matches
const GRANT_MATCHES = [
  {
    id: "1",
    title: "Tech Innovation Grant 2024",
    provider: "Department of Innovation",
    amount: "$250,000",
    score: 92,
    status: "Likely eligible",
    deadline: "March 15, 2024",
    description: "Supporting technology startups with innovative AI solutions for business automation.",
    whyMatch: "Your AI-powered platform aligns perfectly with this grant's focus on business automation technology.",
    requirements: [
      { item: "Business plan", completed: true },
      { item: "Financial projections", completed: true },
      { item: "Technical documentation", completed: false },
      { item: "Team CVs", completed: false },
      { item: "Market analysis", completed: true },
    ],
    tags: ["AI", "Technology", "Innovation", "Automation"],
  },
  {
    id: "2",
    title: "Small Business Growth Fund",
    provider: "Regional Development Agency",
    amount: "$100,000",
    score: 78,
    status: "Mixed",
    deadline: "April 30, 2024",
    description: "Supporting small businesses in scaling operations and entering new markets.",
    whyMatch: "Your expansion plans and market entry strategy match this fund's objectives.",
    requirements: [
      { item: "Company registration", completed: true },
      { item: "Revenue statements", completed: true },
      { item: "Growth strategy", completed: false },
      { item: "Market research", completed: false },
      { item: "Employment plan", completed: false },
    ],
    tags: ["Growth", "Scaling", "SME", "Regional"],
  },
  {
    id: "3",
    title: "Digital Transformation Initiative",
    provider: "European Commission",
    amount: "$500,000",
    score: 65,
    status: "Not eligible",
    deadline: "May 20, 2024",
    description: "Supporting digital transformation projects across European markets.",
    whyMatch: "While your technology is relevant, the geographic requirements may not align with your current setup.",
    requirements: [
      { item: "EU presence required", completed: false },
      { item: "Partnership agreements", completed: false },
      { item: "Digital strategy", completed: true },
      { item: "Impact assessment", completed: false },
      { item: "Sustainability plan", completed: false },
    ],
    tags: ["Digital", "EU", "Transformation", "International"],
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Likely eligible":
      return "bg-green-50 text-green-700 border-green-200"
    case "Mixed":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "Not eligible":
      return "bg-red-50 text-red-700 border-red-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Likely eligible":
      return <CheckCircle className="h-4 w-4" />
    case "Mixed":
      return <Clock className="h-4 w-4" />
    case "Not eligible":
      return <AlertCircle className="h-4 w-4" />
    default:
      return null
  }
}

const getTagIcon = (tag: string) => {
  const tagLower = tag.toLowerCase()
  
  switch (tagLower) {
    case "ai":
    case "technology":
      return <Cpu className="h-3 w-3" />
    case "innovation":
    case "digital":
      return <Lightbulb className="h-3 w-3" />
    case "automation":
      return <Zap className="h-3 w-3" />
    case "growth":
    case "scaling":
      return <TrendingUp className="h-3 w-3" />
    case "sme":
    case "business":
      return <Briefcase className="h-3 w-3" />
    case "regional":
    case "local":
      return <MapPin className="h-3 w-3" />
    case "eu":
    case "international":
      return <Globe className="h-3 w-3" />
    case "transformation":
      return <Target className="h-3 w-3" />
    case "startup":
    case "team":
      return <Users className="h-3 w-3" />
    case "code":
    case "development":
      return <Code className="h-3 w-3" />
    default:
      return <Target className="h-3 w-3" />
  }
}

export default function ResultsPage() {
  const [selectedGrant, setSelectedGrant] = useState<string | null>(null)

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

        {/* Results - macOS Style Cards */}
        <div className="space-y-3">
          {GRANT_MATCHES.map((grant) => {
            const completedRequirements = grant.requirements.filter((req) => req.completed).length
            const totalRequirements = grant.requirements.length
            const completionPercentage = (completedRequirements / totalRequirements) * 100

            return (
              <div key={grant.id} className="bg-white rounded-lg shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="flex flex-col lg:flex-row">
                  {/* Left side - Main content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{grant.title}</h3>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(grant.status)}`}>
                            {getStatusIcon(grant.status)}
                            {grant.status}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{grant.provider}</p>
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{grant.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Why it matches */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">Why this matches</h4>
                        <p className="text-xs text-gray-700 leading-relaxed">{grant.whyMatch}</p>
                      </div>

                      {/* Progress and details */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">Application Progress</span>
                          <span className="text-xs text-gray-600 font-medium">
                            {completedRequirements}/{totalRequirements}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Deadline:</span> {grant.deadline}
                        </div>
                      </div>
                    </div>

                    {/* Tags - macOS style */}
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {grant.tags.map((tag) => (
                          <div
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            {getTagIcon(tag)}
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Actions and score */}
                  <div className="lg:w-72 border-l border-gray-200/60 bg-gray-50/50 p-5 flex flex-col justify-between">
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{grant.amount}</div>
                      <div className="text-xs text-gray-600 mb-2">Maximum Funding</div>
                      <div className="text-xl font-bold text-blue-600">{grant.score}%</div>
                      <div className="text-xs text-gray-600">Match Score</div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs"
                        onClick={() => handleChatClick(grant.id)}
                      >
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        Ask Questions
                      </Button>
                      <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        View Details
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
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200/60 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Need Help with Your Applications?</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Our AI assistant can help you understand requirements, prepare documents, and answer questions about
              specific grants.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 text-xs">
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                Chat with AI Assistant
              </Button>
              <Link href="/sme/dashboard">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
