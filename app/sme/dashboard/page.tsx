"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Target, Calendar, DollarSign, ExternalLink, Play, ArrowRight, Loader2, Building2, Clock, TrendingUp, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

// Minimal Match Score Component
const MatchScore = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="text-right">
      <div className={cn("text-sm font-mono", getColor(score))}>
        {score}%
      </div>
      <div className="text-xs text-gray-500">match</div>
    </div>
  )
}

// Clean Readiness Indicator
const ReadinessBar = ({ percentage }: { percentage: number }) => {
  const getColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500"
    if (percentage >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">Readiness</span>
        <span className="text-xs font-mono text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className={cn("h-1 rounded-full transition-all duration-300", getColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Simplified grant data
const GRANTS = [
  {
    id: "1",
    title: "EIC Accelerator",
    issuer: "European Commission",
    amount: "€2.5M",
    deadline: "Mar 15",
    matchScore: 87,
    readiness: 60,
    tags: ["Deep Tech", "EU"],
    description: "Breakthrough innovation support with grant funding up to €2.5M plus equity investment for high-risk, high-impact innovations.",
    whyMatch: "AI/ML platform development aligns with deep tech innovation focus",
    keyRequirement: "EU presence required",
    timeToSubmit: "6-8 weeks",
    successRate: "2.8%"
  },
  {
    id: "2",
    title: "Digital Europe Programme",
    issuer: "European Commission",
    amount: "€800K",
    deadline: "Apr 30",
    matchScore: 74,
    readiness: 80,
    tags: ["AI/ML", "Consortium"],
    description: "Advanced digital technologies including AI, cybersecurity, and high-performance computing deployment across Europe.",
    whyMatch: "Strong alignment with AI development and digital transformation",
    keyRequirement: "3+ EU entity consortium",
    timeToSubmit: "4-5 weeks",
    successRate: "15.2%"
  },
  {
    id: "3",
    title: "Innovate UK Smart Grants",
    issuer: "UK Research and Innovation",
    amount: "£2M",
    deadline: "Rolling",
    matchScore: 68,
    readiness: 40,
    tags: ["R&D", "UK"],
    description: "Game-changing and commercially viable R&D innovations with significant UK economic impact potential.",
    whyMatch: "Innovation focus matches R&D platform development objectives",
    keyRequirement: "UK-based company required",
    timeToSubmit: "8-10 weeks",
    successRate: "25.7%"
  }
]

export default function FundingDashboard() {
  const [goalInput, setGoalInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = async () => {
    if (!goalInput.trim()) return
    setSearchQuery(goalInput) // Store the search query when user clicks send
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      setHasResults(true)
    }, 2500)
  }

  const handleReset = () => {
    setGoalInput("")
    setHasResults(false)
    setSearchQuery("")
  }

  // Auto-scroll when results appear
  useEffect(() => {
    if (hasResults && !isLoading) {
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section')
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }, [hasResults, isLoading])

  // Add scroll snap behavior
  useEffect(() => {
    const container = document.querySelector('.snap-y') as HTMLElement
    if (container) {
      container.style.scrollBehavior = 'smooth'
    }
  }, [])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center snap-y snap-mandatory overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 w-full">
        
        {/* Header */}
        <div className={`mb-8 text-center snap-start ${hasResults ? 'pt-16' : ''}`}>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-2xl font-medium text-gray-900 mb-3">
            {isLoading ? "Finding funding..." : "Ready to find funding?"}
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {isLoading ? "Searching through opportunities..." : "Describe your funding goals and we'll show you relevant opportunities."}
          </p>
        </div>

        {/* Search Input - Carbon Copy of Reference */}
        {!isLoading && (
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
            {/* Input Container - Dynamic Shape Based on Content */}
            <div className={`relative bg-gray-100 transition-all duration-200 ${
              goalInput.split('\n').length === 1 && goalInput.length < 50 ? 'rounded-full' : 'rounded-2xl'
            }`}>
              <Textarea
                placeholder="What it takes to makes your dreams come through"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                rows={goalInput.split('\n').length > 1 ? Math.min(goalInput.split('\n').length, 4) : 1}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none placeholder:text-gray-500 text-gray-900 py-3 px-5"
                style={{ 
                  minHeight: '48px', 
                  maxHeight: '120px',
                  outline: 'none',
                  boxShadow: 'none',
                  paddingRight: goalInput.split('\n').length > 2 ? '20px' : '80px'
                }}
                onFocus={(e) => e.target.style.outline = 'none'}
                onBlur={(e) => e.target.style.outline = 'none'}
              />
              
              {/* Controls - Position based on content */}
              {goalInput.split('\n').length > 2 ? (
                // Expanded mode: Controls below text
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                  {/* Circular Progress */}
                  <div className="w-6 h-6 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-gray-300"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(goalInput.length, 1000) / 1000)}`}
                        className="text-blue-500 transition-all duration-300"
                      />
                    </svg>
                  </div>
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSearch}
                    disabled={!goalInput.trim() || isLoading}
                    className="w-6 h-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 text-white animate-spin" />
                    ) : (
                      <ArrowUp className="h-3 w-3 text-white" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              ) : (
                // Single line mode: Controls on right side
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {/* Circular Progress */}
                  <div className="w-6 h-6 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        className="text-gray-300"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 8}`}
                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(goalInput.length, 1000) / 1000)}`}
                        className="text-blue-500 transition-all duration-300"
                      />
                    </svg>
                  </div>
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSearch}
                    disabled={!goalInput.trim() || isLoading}
                    className="w-6 h-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 text-white animate-spin" />
                    ) : (
                      <ArrowUp className="h-3 w-3 text-white" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              )}
            </div>
            
              {/* Helper Text */}
              <div className="text-center mt-3">
                <p className="text-sm text-gray-500 italic">
                  Tips: Be specific about timeline, amount, and objectives
                </p>
              </div>
            </div>
          </div>
        )}


        {/* Results */}
        {hasResults && !isLoading && (
          <div id="results-section" className="space-y-8 mt-8 snap-start min-h-screen flex flex-col">
            {/* Results Header */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                {GRANTS.length} matches found
              </h2>
              <p className="text-sm text-gray-600">
                Based on: "{searchQuery.substring(0, 120)}..."
              </p>
            </div>

            {/* Grant List - Compact iOS Style */}
            <div className="space-y-2">
              {GRANTS.map((grant) => (
                <div key={grant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Header with Match Score */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1 leading-tight">
                          {grant.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {grant.issuer}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          {grant.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <MatchScore score={grant.matchScore} />
                      </div>
                    </div>
                  </div>

                  {/* Key Stats - Compact Grid */}
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 mb-0.5">
                          {grant.amount}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Amount
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 mb-0.5">
                          {grant.deadline}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Deadline
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 mb-0.5">
                          {grant.successRate}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description - Compact */}
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {grant.description}
                    </p>
                  </div>

                  {/* Match Reasons - Compact */}
                  <div className="px-4 pb-3">
                    <div className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Match:</span> {grant.whyMatch}
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Requirement:</span> {grant.keyRequirement}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Readiness Progress - Compact */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700">Readiness</span>
                      <span className="text-xs text-gray-500">{grant.readiness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${grant.readiness}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions - Compact Buttons */}
                  <div className="px-4 pb-4">
                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 text-xs">
                        <ExternalLink className="h-3 w-3" />
                        Details
                      </button>
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 text-xs">
                        <Play className="h-3 w-3" />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center pt-8">
              <Button variant="outline" className="border-gray-300 text-gray-700">
                View all opportunities
              </Button>
            </div>
          </div>
        )}

        {/* Empty State - Hidden since content is now in header */}
        {!hasResults && !isLoading && (
          <div className="mt-8"></div>
        )}
      </div>
    </div>
  )
}