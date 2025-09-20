"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, CheckCircle, Clock, AlertCircle, ExternalLink, CheckCircle2, Send, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface TodoItem {
  id: string
  title: string
  description: string
  completed: boolean
  category: "documents" | "business" | "financial" | "timeline"
  timeLimit?: string
}

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
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

const CATEGORY_COLORS = {
  documents: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  financial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  timeline: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}


export default function ResultsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! I'm your Grant Matching Assistant. I've found some potential funding opportunities for you. Feel free to ask me questions about any of these grants or how to improve your matches!",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isTodoCollapsed, setIsTodoCollapsed] = useState(true)

  const handleChatClick = (grantId: string) => {
    // Navigate to specific grant page
    window.location.href = `/sme/grant/${grantId}`
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputMessage),
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("eligible") || lowerInput.includes("eligibility")) {
      return "I can help you assess your eligibility for any grant! Click on 'View Details' for a specific grant to see the detailed eligibility requirements and checklist. Each grant has different criteria like company size, location, industry focus, etc."
    }

    if (lowerInput.includes("deadline") || lowerInput.includes("time")) {
      return "Application deadlines vary by grant. I recommend starting your preparation 4-6 weeks before the deadline. The most urgent ones are shown first, and I'll remind you about upcoming deadlines automatically."
    }

    if (lowerInput.includes("documents") || lowerInput.includes("requirements")) {
      return "Each grant has specific document requirements. Common ones include business plans, financial statements, company registration, and market research. Click 'View Details' on any grant to see the full checklist and upload system."
    }

    if (lowerInput.includes("amount") || lowerInput.includes("funding")) {
      return "The funding amounts shown are maximum possible amounts. Your actual award depends on your specific needs and the grant program's budget. Most grants are competitive, so a strong application increases your chances."
    }

    return "That's a great question! I can help you with any aspect of the grant application process. Feel free to ask about specific grants, eligibility requirements, or preparation strategies. You can also click 'View Details' on any grant to dive deeper."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-y-auto">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold">Grant Matching Results</h1>
          <p className="text-sm text-muted-foreground">Review your funding matches and get personalized guidance</p>
        </div>
      </div>

      {/* Main Content Area - Chat + Fixed Grant Matches Section */}
      <div className="flex-1 relative min-h-0">
        {/* Chat Messages - Scrollable */}
        <ScrollArea className="h-full p-3 pb-0">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.sender === "user" && "justify-end")}>
                {message.sender === "user" ? (
                  <div className={cn(
                    "max-w-[80%] px-4 py-3 bg-primary text-primary-foreground",
                    message.content.split('\n').length === 1 && message.content.length < 50
                      ? "rounded-full"
                      : "rounded-2xl"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[80%]">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex">
                <div className="max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Fixed Grant Matches Section - Positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-background z-10">
          <div className="p-0">
            <div className="max-w-4xl mx-auto">
              {/* Integrated Grant Matches + Text Input */}
              <div className="relative">
                {/* Collapsible Grant Matches Section */}
                {!isTodoCollapsed && (
                  <div className="bg-transparent border border-border rounded-t-2xl shadow-sm mb-0">
                    {/* Grant Matches Header */}
                    <div
                      className="flex items-center justify-between p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors rounded-t-2xl"
                      onClick={() => setIsTodoCollapsed(!isTodoCollapsed)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Your Funding Matches</span>
                          <Badge variant="secondary" className="text-xs">
                            {GRANT_MATCHES.length}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">Hide</span>
                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Grant Matches Content */}
                    <div className="p-4">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {GRANT_MATCHES.map((grant) => (
                          <div key={grant.grant_id} className="bg-white rounded-lg shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-md transition-all duration-200">
                            <div className="p-4">
                              {/* Header: Title + Verdict + Amount + Deadline */}
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
                                <div className="text-right ml-4">
                                  <div className="text-xl font-bold text-black-600">{formatAmount(grant.amount_max_myr)}</div>
                                  <div className="text-xs text-gray-500">Maximum Funding</div>
                                </div>
                              </div>

                              {/* Content row: Why + Dealbreakers */}
                              <div className="flex flex-wrap items-start gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Why:</span> {grant.why}
                                  </p>
                                </div>

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
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Input */}
                <div className="relative">
                  {/* Show Grant Matches Button - When collapsed */}
                  {isTodoCollapsed && (
                    <div
                      className="flex items-center justify-between p-3 mb-0 border border-border border-b-0 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-2xl bg-background"
                      onClick={() => setIsTodoCollapsed(!isTodoCollapsed)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Your Funding Matches</span>
                          <Badge variant="secondary" className="text-xs">
                            {GRANT_MATCHES.length}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">Show</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Text Input Area */}
                  <div className={cn(
                    "bg-background border border-border shadow-sm focus-within:shadow-md focus-within:border-primary/50 transition-all duration-200 mb-6",
                    isTodoCollapsed ? "rounded-2xl" : "rounded-b-2xl border-t-0"
                  )}>
                    <div className="flex items-end gap-3 p-4">
                      <div className="flex-1">
                        <textarea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your funding matches..."
                          className="w-full min-h-[2.5rem] max-h-[8rem] resize-none bg-transparent border-0 outline-none placeholder:text-muted-foreground text-sm leading-relaxed"
                          rows={1}
                          style={{
                            minHeight: '2.5rem',
                            maxHeight: '8rem',
                            overflow: 'auto'
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 rounded-full hover:bg-muted"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          size="sm"
                          className="h-9 w-9 rounded-full"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
