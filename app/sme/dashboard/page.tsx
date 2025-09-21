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

// Types for API response
interface GrantMatch {
  grant_id: string
  title: string
  issuer: string
  country: string | null
  deadline: string | null
  amount_min: number | null
  amount_max: number | null
  sector_tags: string[]
  relevance_score: number
  match_reasoning: string
  key_benefits: string[]
  potential_concerns: string[]
  recommended_focus: string
  deadline_urgency: string
  competition_level: string
  required_documents: string[]
  eligibility_rules: Array<{ key: string; value: string }>
}

interface MatchmakingResponse {
  statusCode: number
  body: {
    message: string
    sme_goals: string
    matches: GrantMatch[]
    total_matches: number
    processed_at: string
  }
}

export default function FundingDashboard() {
  const [goalInput, setGoalInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [grants, setGrants] = useState<GrantMatch[]>([])
  const [error, setError] = useState<string | null>(null)
  const [totalMatches, setTotalMatches] = useState(0)
  const [allGrants, setAllGrants] = useState<GrantMatch[]>([])
  const [showAllGrants, setShowAllGrants] = useState(false)
  const [loadingAllGrants, setLoadingAllGrants] = useState(false)

  const handleSearch = async () => {
    if (!goalInput.trim()) return
    setSearchQuery(goalInput)
    setIsLoading(true)
    setError(null)
    
    try {
      const requestBody = {
        goals: goalInput.trim(),
        sme_id: "sme-12345", // You might want to get this from user context
        max_matches: 10
      }
      
      console.log('Sending request to API:', requestBody)
      
      const response = await fetch('https://ys2o24njhf.execute-api.ap-southeast-1.amazonaws.com/dev/matchmaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response:', data) // Debug log
      
      // Handle different response structures
      if (data.statusCode === 200 && data.body && data.body.matches) {
        // Standard API Gateway response format
        setGrants(data.body.matches)
        setTotalMatches(data.body.total_matches || data.body.matches.length)
        setHasResults(true)
      } else if (data.matches) {
        // Direct response without statusCode wrapper
        setGrants(data.matches)
        setTotalMatches(data.total_matches || data.matches.length)
        setHasResults(true)
      } else if (data.body && data.body.matches) {
        // Response with body but no statusCode
        setGrants(data.body.matches)
        setTotalMatches(data.body.total_matches || data.body.matches.length)
        setHasResults(true)
      } else {
        // Handle "No matches found" or "No grants currently available" as valid responses
        const message = data.body?.message || data.message || 'No matches found'
        console.log('No matches found. Full response:', data)
        
        if (message === 'No grants currently available' || 
            message === 'No matches found' ||
            message === 'Successfully found grant matches') {
          // API returned success but no matches - show empty state instead of error
          setGrants([])
          setTotalMatches(0)
          setHasResults(true)
          setError(null) // Clear any previous errors
        } else {
          throw new Error(message)
        }
      }
    } catch (err) {
      console.error('Error fetching matches:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      })
      
      let errorMessage = 'Failed to fetch matches'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      setError(errorMessage)
      setHasResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setGoalInput("")
    setHasResults(false)
    setSearchQuery("")
    setGrants([])
    setError(null)
    setTotalMatches(0)
    setShowAllGrants(false)
  }

  const fetchAllGrants = async () => {
    setLoadingAllGrants(true)
    setError(null)
    
    try {
      // Use the dedicated sme-fetch-grants endpoint to get all available grants
      const response = await fetch('https://53k3dtbhjf.execute-api.ap-southeast-1.amazonaws.com/dev/sme-fetch-grants?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('All grants response:', data)
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Handle the sme-fetch-grants response format
      if (data.statusCode === 200 && data.body && data.body.grants) {
        // Standard API Gateway response format with grants array
        const formattedGrants = data.body.grants.map((grant: any) => ({
          grant_id: grant.grant_id,
          title: grant.title,
          issuer: grant.issuer,
          country: grant.country,
          deadline: grant.deadline,
          amount_min: grant.amount_min,
          amount_max: grant.amount_max,
          sector_tags: grant.sector_tags || [],
          relevance_score: 0.3, // Default score for all grants view
          match_reasoning: "Available grant opportunity",
          key_benefits: ["Funding opportunity", "Business growth support"],
          potential_concerns: ["Check eligibility requirements"],
          recommended_focus: "Review grant details and requirements",
          deadline_urgency: "medium",
          competition_level: "medium",
          required_documents: grant.required_documents || [],
          eligibility_rules: grant.eligibility_rules || []
        }))
        
        setAllGrants(formattedGrants)
        setShowAllGrants(true)
        setHasResults(true)
      } else if (data.grants) {
        // Handle direct response format with grants array
        const formattedGrants = data.grants.map((grant: any) => ({
          grant_id: grant.grant_id,
          title: grant.title,
          issuer: grant.issuer,
          country: grant.country,
          deadline: grant.deadline,
          amount_min: grant.amount_min,
          amount_max: grant.amount_max,
          sector_tags: grant.sector_tags || [],
          relevance_score: 0.3,
          match_reasoning: "Available grant opportunity",
          key_benefits: ["Funding opportunity", "Business growth support"],
          potential_concerns: ["Check eligibility requirements"],
          recommended_focus: "Review grant details and requirements",
          deadline_urgency: "medium",
          competition_level: "medium",
          required_documents: grant.required_documents || [],
          eligibility_rules: grant.eligibility_rules || []
        }))
        
        setAllGrants(formattedGrants)
        setShowAllGrants(true)
        setHasResults(true)
      } else {
        console.error('Unexpected response structure:', data)
        console.error('Expected: data.statusCode === 200 && data.body.grants or data.grants')
        console.error('Actual: statusCode =', data.statusCode, ', body =', data.body ? 'exists' : 'missing', ', grants =', data.body?.grants ? 'exists' : 'missing')
        throw new Error(data.body?.message || data.message || `Unexpected response: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      console.error('Error fetching all grants:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch grants')
    } finally {
      setLoadingAllGrants(false)
    }
  }

  // Helper function to format amount range
  const formatAmount = (min: number | null, max: number | null) => {
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`
    } else if (min) {
      return `$${(min / 1000).toFixed(0)}K+`
    } else if (max) {
      return `Up to $${(max / 1000).toFixed(0)}K`
    }
    return "Amount TBD"
  }

  // Helper function to format deadline
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "Open"
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "Closed"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays <= 7) return `${diffDays}d left`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w left`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Helper function to get deadline color
  const getDeadlineColor = (deadline: string | null) => {
    if (!deadline) return "text-blue-600"
    const date = new Date(deadline)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return "text-gray-500"
    if (diffDays <= 3) return "text-red-600"
    if (diffDays <= 7) return "text-orange-600"
    if (diffDays <= 30) return "text-amber-600"
    return "text-green-600"
  }

  // Helper function to format competition level
  const formatCompetition = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'Low'
      case 'medium': return 'Moderate'
      case 'high': return 'High'
      default: return 'Moderate'
    }
  }

  // Helper function to get competition color
  const getCompetitionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-amber-600'
      case 'high': return 'text-red-600'
      default: return 'text-amber-600'
    }
  }

  // Helper function to calculate readiness based on urgency and competition
  const calculateReadiness = (urgency: string, competition: string) => {
    let baseScore = 50
    if (urgency === 'low') baseScore += 20
    else if (urgency === 'medium') baseScore += 10
    
    if (competition === 'low') baseScore += 20
    else if (competition === 'medium') baseScore += 10
    
    return Math.min(baseScore, 95)
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


        {/* Error State */}
        {error && !isLoading && (
          <div id="error-section" className="space-y-8 mt-8 snap-start min-h-screen flex flex-col">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Unable to find matches
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {error}
              </p>
              <Button onClick={handleReset} variant="outline">
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {hasResults && !isLoading && !error && (
          <div id="results-section" className="space-y-8 mt-8 snap-start min-h-screen flex flex-col">
            {/* Results Header */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">
                    {showAllGrants ? `${allGrants.length} available grants` : `${totalMatches} matches found`}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {showAllGrants 
                      ? "All available funding opportunities" 
                      : `Based on: "${searchQuery.substring(0, 120)}..."`
                    }
                  </p>
                </div>
                {!showAllGrants && (
                  <Button 
                    onClick={fetchAllGrants} 
                    variant="outline" 
                    disabled={loadingAllGrants}
                    className="ml-4"
                  >
                    {loadingAllGrants ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "View All Grants"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Grant List - Compact iOS Style */}
            <div className="space-y-2">
              {(showAllGrants ? allGrants : grants).map((grant) => (
                <div key={grant.grant_id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Header with Match Score */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1 leading-tight">
                          {grant.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {grant.issuer} {grant.country && `• ${grant.country}`}
                        </p>
                        <div className="flex gap-1 flex-wrap">
                          {grant.sector_tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                        <div className="ml-3 flex-shrink-0">
                          {showAllGrants ? (
                            <div className="text-right">
                              <div className="text-sm font-mono text-blue-600">
                                Available
                              </div>
                              <div className="text-xs text-gray-500">
                                Grant
                              </div>
                            </div>
                          ) : (
                            <MatchScore score={Math.round(grant.relevance_score * 100)} />
                          )}
                        </div>
                    </div>
                  </div>

                  {/* Key Stats - Compact Grid */}
                  <div className="px-4 pb-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 mb-0.5">
                          {formatAmount(grant.amount_min, grant.amount_max)}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Amount
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-lg font-bold mb-0.5 ${getDeadlineColor(grant.deadline)}`}>
                          {formatDeadline(grant.deadline)}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Deadline
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-lg font-bold mb-0.5 ${getCompetitionColor(grant.competition_level)}`}>
                          {formatCompetition(grant.competition_level)}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Competition
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasoning - Compact */}
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {showAllGrants 
                        ? `Funding opportunity from ${grant.issuer}. ${grant.sector_tags.length > 0 ? `Sectors: ${grant.sector_tags.join(', ')}.` : ''}`
                        : grant.match_reasoning
                      }
                    </p>
                  </div>

                  {/* Key Benefits - Compact */}
                  <div className="px-4 pb-3">
                    <div className="bg-gray-50 rounded-lg p-2 space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Benefits:</span> {grant.key_benefits.slice(0, 2).join(', ')}
                        </div>
                      </div>
                      {grant.potential_concerns.length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">Consider:</span> {grant.potential_concerns[0]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Readiness Progress - Compact */}
                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700">Readiness</span>
                      <span className="text-xs text-gray-500">{calculateReadiness(grant.deadline_urgency, grant.competition_level)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${calculateReadiness(grant.deadline_urgency, grant.competition_level)}%` }}
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
              {showAllGrants ? (
                <Button 
                  onClick={() => setShowAllGrants(false)} 
                  variant="outline" 
                  className="border-gray-300 text-gray-700"
                >
                  Back to Matches
                </Button>
              ) : (
                <Button 
                  onClick={fetchAllGrants} 
                  variant="outline" 
                  className="border-gray-300 text-gray-700"
                  disabled={loadingAllGrants}
                >
                  {loadingAllGrants ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "View all opportunities"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Empty State - Show when no results and no error */}
        {!hasResults && !isLoading && !error && (
          <div className="mt-8 text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Ready to find funding?
            </h2>
            <p className="text-sm text-gray-600">
              Describe your funding goals above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}