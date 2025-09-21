"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  CheckCircle2,
  Send,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  MessageCircle,
  ArrowLeft,
  Clock,
  Target,
  ExternalLink,
  Play,
  FileCheck,
  Building,
  Filter,
  Plus,
  X,
  ChevronRight,
  Circle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CircularProgress } from "@/components/ui/circular-progress"

// Mock grants list for sidebar - in real app, this would come from API
const MOCK_GRANTS = [
  {
    id: "1",
    title: "European Innovation Council Accelerator",
    amount: "$2.5M",
    date: "Mar 15",
    assignee: "Innovation Team",
    status: "active",
    progress: 85,
    logo: "🇪🇺",
    count: 1,
    isSelected: true,
  },
  {
    id: "2", 
    title: "SBIR Phase II Grant",
    amount: "$750k",
    date: "Apr 20",
    assignee: "Research Division",
    status: "active",
    progress: 60,
    logo: "🔬",
    count: 2,
  },
  {
    id: "3",
    title: "Green Tech Innovation Fund",
    amount: "$1.2M",
    date: "May 10",
    assignee: "Sustainability Team",
    status: "pending",
    progress: 25,
    logo: "🌱",
    count: 1,
  },
]

// Mock data - in real app, this would come from API based on params.id
const GRANT_DATA = {
  "1": {
    id: "1",
    title: "European Innovation Council Accelerator",
    issuer: "European Commission",
    maxAmount: "$2,500,000",
    deadline: "2025-03-15",
    badge: "Likely",
    score: 85,
    whyItMatches: "Strong tech innovation focus aligns with your AI/ML development goals",
    dealbreakers: "Requires EU presence",
    progress: { current: 2, total: 5 },
    tags: ["Innovation", "Technology", "EU"],
    status: "Open",
    description: "The EIC Accelerator supports SMEs with breakthrough innovations and high growth potential. This program provides both grant funding and equity investment to help companies scale their innovative solutions.",
    playbook: "Innovation Grant Strategy",
    eligibility: [
      "EU-based SMEs or startups",
      "Technology Readiness Level 5-8",
      "Strong innovation component",
      "Clear market potential",
      "Scalable business model"
    ],
    benefits: [
      "Up to €2.5M in grant funding",
      "Up to €15M in equity investment",
      "Business coaching and mentoring",
      "Access to EIC network and partners"
    ],
    criteria: [
      "Success criteria: Demonstrate TRL 5-8 with working prototype and validation results",
      "Champion: EU Innovation Council review panel scheduled for next quarter",
      "Risks: EU presence requirement may need partnership or subsidiary establishment",
    ],
    nextSteps: [
      {
        id: 1,
        text: "Complete Technology Readiness Assessment and gather evidence of current development stage",
        completed: true,
        note: "TRL assessment completed at level 6...",
      },
      {
        id: 2,
        text: "Prepare detailed market analysis showing innovation potential and market need",
        completed: false,
      },
      {
        id: 3,
        text: "Create 3-year financial projections including funding use plan",
        completed: false,
        dueDate: "Due in 2 weeks",
      },
    ],
    suggestedSteps: [
      "Research EU subsidiary requirements and costs for establishing presence",
      "Connect with EIC mentors through the accelerator network for guidance",
    ]
  }
}

// Grant-specific eligibility rules
const getEligibilityRules = (grantId: string) => {
  const rules = {
    "1": [
      {
        id: "1",
        rule: "EU-based SMEs or startups",
        status: "uncertain" as const,
        reason: "Company location needs verification"
      },
      {
        id: "2",
        rule: "Technology Readiness Level 5-8",
        status: "uncertain" as const,
        reason: "TRL assessment required"
      },
      {
        id: "3",
        rule: "Strong innovation component",
        status: "pass" as const,
        reason: "AI/ML innovation matches requirement"
      },
      {
        id: "4",
        rule: "Clear market potential",
        status: "uncertain" as const,
        reason: "Market analysis needed"
      },
      {
        id: "5",
        rule: "Scalable business model",
        status: "pass" as const,
        reason: "Software business model is scalable"
      },
    ]
  }
  return rules[grantId as keyof typeof rules] || []
}

// Grant-specific checklist items
const getChecklistItems = (grantId: string) => {
  const checklists = {
    "1": [
      {
        id: "1",
        title: "Technology Readiness Assessment",
        description: "Complete TRL assessment form and provide evidence of current development stage",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "2",
        title: "Market Analysis & Impact",
        description: "Prepare detailed market analysis showing innovation potential and market need",
        completed: false,
        category: "business" as const,
        required: true
      },
      {
        id: "3",
        title: "Financial Projections",
        description: "Create 3-year financial projections including funding use plan",
        completed: false,
        category: "financial" as const,
        required: true
      },
      {
        id: "4",
        title: "Innovation Description",
        description: "Write detailed technical description of your innovation and competitive advantages",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "5",
        title: "Team & Company Profile",
        description: "Prepare team CVs and company background documentation",
        completed: false,
        category: "business" as const,
        required: true
      },
    ]
  }
  return checklists[grantId as keyof typeof checklists] || []
}

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

const CATEGORY_COLORS = {
  documents: "bg-blue-100 text-blue-800",
  business: "bg-green-100 text-green-800",
  financial: "bg-yellow-100 text-yellow-800",
  timeline: "bg-purple-100 text-purple-800",
}

const CATEGORY_ICONS = {
  documents: FileText,
  business: Building,
  financial: DollarSign,
  timeline: Clock,
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pass":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "fail":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "uncertain":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    default:
      return null
  }
}

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "Likely":
      return "bg-green-100 text-green-800 border-green-200"
    case "Mixed":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Not eligible":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pass":
      return "bg-green-50 text-green-800 border-green-200"
    case "fail":
      return "bg-red-50 text-red-800 border-red-200"
    case "uncertain":
      return "bg-yellow-50 text-yellow-800 border-yellow-200"
    default:
      return "bg-gray-50 text-gray-800 border-gray-200"
  }
}

export default function GrantDetailPage() {
  const params = useParams()
  const grantId = params.id as string
  const grant = GRANT_DATA[grantId as keyof typeof GRANT_DATA]
  const currentGrant = GRANT_DATA[grantId as keyof typeof GRANT_DATA]

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: `Hi! I'm your EIC Accelerator application assistant. I see you're interested in applying for the European Innovation Council Accelerator program. This is a great fit for your AI/ML innovation! I've prepared a customized to-do list based on the EIC requirements. What would you like to know about first?`,
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isTodoCollapsed, setIsTodoCollapsed] = useState(false)

  // Next steps functionality from momentum design
  const [nextSteps, setNextSteps] = useState(currentGrant?.nextSteps || [])
  const [newStep, setNewStep] = useState("")
  const [showSuggested, setShowSuggested] = useState(true)

  const checklistItems = getChecklistItems(grantId)
  const eligibilityRules = getEligibilityRules(grantId)

  const completedCount = checklistItems.filter(item => item.completed).length
  const totalCount = checklistItems.length
  const progressPercentage = (completedCount / totalCount) * 100

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

    if (lowerInput.includes("trl") || lowerInput.includes("readiness")) {
      return "For the EIC Accelerator, you need to demonstrate TRL 5-8. TRL 5 means your technology works in a relevant environment, TRL 8 means it's complete and qualified. Since you're developing AI/ML solutions, you'll need to show: 1) Working prototype, 2) Validation results, 3) Path to commercialization. What TRL level would you say you're currently at?"
    }

    if (lowerInput.includes("market") || lowerInput.includes("analysis")) {
      return "For the EIC, your market analysis should include: 1) Total Addressable Market (TAM) size, 2) Serviceable Available Market (SAM), 3) Serviceable Obtainable Market (SOM), 4) Growth projections with data sources, 5) Competitive landscape analysis. The EIC wants to see you understand both the market opportunity and your competitive advantages."
    }

    if (lowerInput.includes("financial") || lowerInput.includes("projection")) {
      return "Your financial projections should cover 3-5 years and include: 1) Revenue model breakdown, 2) Cost structure analysis, 3) Funding requirements and use of funds, 4) Break-even analysis, 5) Key financial metrics (burn rate, runway, etc.). The EIC will scrutinize these carefully, so make sure your assumptions are realistic and well-supported."
    }

    if (lowerInput.includes("deadline") || lowerInput.includes("timeline")) {
      return `The deadline is ${new Date(grant.deadline).toLocaleDateString()}, which is about 3 months away. I recommend: 1) Complete all documentation by Feb 15, 2) Final review and revisions Feb 15-28, 3) Submit by March 1 to avoid last-minute issues. The EIC evaluation process takes 3-4 months, so plan accordingly.`
    }

    if (lowerInput.includes("eligible") || lowerInput.includes("eligibility")) {
      return "Based on your AI/ML innovation focus, you should be a good fit for the EIC Accelerator! The main requirements are: EU presence (this might be a challenge), TRL 5-8, strong innovation component, clear market potential, and scalable business model. You may need to address the EU presence requirement or consider partnering with an EU entity."
    }

    return "That's a great question about the EIC Accelerator! I can help you with any aspect of the application process. Feel free to ask about specific requirements, evaluation criteria, or strategies to improve your chances of success. You can also click on any to-do item to get detailed guidance on completing it."
  }

  const toggleChecklistItem = (id: string) => {
    // In a real app, this would update the state and persist to backend
    console.log(`Toggling checklist item ${id}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Momentum design functionality
  const handleStepToggle = (id: number) => {
    setNextSteps((prev) => prev.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step)))
  }

  const addNewStep = () => {
    if (newStep.trim()) {
    const newId = Math.max(...nextSteps.map((s) => s.id)) + 1
      setNextSteps((prev) => [...prev, { id: newId, text: newStep, completed: false }])
      setNewStep("")
    }
  }

  const addSuggestedStep = (stepText: string) => {
    const newId = Math.max(...nextSteps.map((s) => s.id)) + 1
    setNextSteps((prev) => [...prev, { id: newId, text: stepText, completed: false }])
  }


  if (!grant) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Grant Not Found</h1>
            <p className="text-gray-600 mb-6">The grant you're looking for doesn't exist.</p>
            <Link href="/sme/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Momentum-style Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">Grant Navigator</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 flex-1">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="flex-shrink-0">Grants</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <span className="text-blue-500 truncate max-w-[200px]">{MOCK_GRANTS.find(g => g.id === grantId)?.logo} {grant.issuer}</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <span className="text-gray-900 font-medium truncate">GRANT-{grantId}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            Snooze
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Grants List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {MOCK_GRANTS.map((grantItem) => (
              <Link key={grantItem.id} href={`/sme/grant/${grantItem.id}`}>
                <div
                  className={`p-3 transition-all duration-200 cursor-pointer group border-b border-gray-100 last:border-b-0 ${
                    grantItem.id === grantId
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <CircularProgress progress={grantItem.progress} size="sm" />
                      <div className="text-2xl">{grantItem.logo}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 min-w-0 overflow-hidden">
                        <div className={`marquee-container ${grantItem.id === grantId ? 'animate-scroll-left-selected' : ''}`}>
                          {grantItem.id === grantId ? (
                            // Scrolling content for selected item
                            <div className="marquee-content">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono">GRANT-{grantItem.id}</span>
                                <span className="text-sm font-medium text-gray-900">{grantItem.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono">GRANT-{grantItem.id}</span>
                                <span className="text-sm font-medium text-gray-900">{grantItem.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono">GRANT-{grantItem.id}</span>
                                <span className="text-sm font-medium text-gray-900">{grantItem.title}</span>
                              </div>
                            </div>
                          ) : (
                            // Truncated content for non-selected items
                            <div className="marquee-content">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono truncate">GRANT-{grantItem.id}</span>
                                <span className="text-sm font-medium text-gray-900 truncate">{grantItem.title}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                        <span className="flex-shrink-0">{grantItem.amount}</span>
                        <span className="flex-shrink-0">•</span>
                        <span className="flex-shrink-0">{grantItem.date}</span>
                        <span className="flex-shrink-0">•</span>
                        <span className="truncate">{grantItem.assignee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="p-8 max-w-4xl mx-auto">
            {/* Grant header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Playbook</span>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                  {currentGrant?.playbook || "Grant Strategy"}
                </Badge>
              </div>

              <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                <p className="break-words">{currentGrant?.description}</p>
                <ul className="space-y-2">
                  {currentGrant?.criteria?.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0 mt-1">•</span>
                      <span className="break-words">{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next steps section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-gray-100 rounded">
                  <CheckCircle2 className="h-4 w-4 text-gray-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Next steps</h2>
              </div>

              <div className="space-y-3">
                {nextSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <button onClick={() => handleStepToggle(step.id)} className="mt-0.5 transition-colors duration-200">
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm break-words ${step.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                        {step.text}
                      </p>
                      {step.note && <p className="text-xs text-gray-500 mt-1 italic break-words">{step.note}</p>}
                    </div>
                    {step.dueDate && <span className="text-xs text-gray-500 mt-0.5">{step.dueDate}</span>}
                  </div>
                ))}

                {/* Add new step */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-gray-300 hover:border-gray-400 transition-colors duration-200">
                  <Plus className="h-5 w-5 text-gray-400" />
                  <Input
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    placeholder="Add next step..."
                    className="border-0 p-0 h-auto text-sm placeholder:text-gray-400 focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addNewStep()
                      }
                    }}
                  />
                </div>
              </div>

              {/* Commented out suggested steps and additional grant information */}
              {/*
              
              {showSuggested && currentGrant?.suggestedSteps && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <Plus className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Add all suggested</span>
                    </div>
                    <button
                      onClick={() => setShowSuggested(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <span className="text-sm mr-2">Remove all</span>
                      <X className="h-4 w-4 inline" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {currentGrant.suggestedSteps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 transition-colors duration-200 group cursor-pointer"
                        onClick={() => addSuggestedStep(step)}
                      >
                        <div className="p-1 bg-white rounded border border-blue-200">
                          <Plus className="h-3 w-3 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-700 flex-1 break-words">{step}</p>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      Previous steps • {checklistItems.length} ▼
                    </button>
                  </div>
                </div>
              )}

              

              {/* Chat Interface - Integrated with Background */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ask about this grant</h3>
                
                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input - Integrated with Background */}
                <div className="relative">
                  <div className={`relative bg-gray-100 border border-gray-300 focus-within:border-gray-400 transition-all duration-200 ${
                    inputMessage.split('\n').length === 1 && inputMessage.length < 50 ? 'rounded-full' : 'rounded-2xl'
                  }`}>
                    <Textarea
                      placeholder="Ask about eligibility, requirements, or next steps..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      rows={inputMessage.split('\n').length > 1 ? Math.min(inputMessage.split('\n').length, 4) : 1}
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none placeholder:text-gray-500 text-gray-900 py-3 px-5"
                      style={{ 
                        minHeight: '48px', 
                        maxHeight: '120px',
                        outline: 'none',
                        boxShadow: 'none',
                        paddingRight: inputMessage.split('\n').length > 2 ? '20px' : '80px'
                      }}
                      onFocus={(e) => e.target.style.outline = 'none'}
                      onBlur={(e) => e.target.style.outline = 'none'}
                      onKeyDown={handleKeyPress}
                    />
                    
                    {/* Controls - Position based on content */}
                    {inputMessage.split('\n').length > 2 ? (
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
                              strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(inputMessage.length, 1000) / 1000)}`}
                              className="text-blue-500 transition-all duration-300"
                            />
                          </svg>
                        </div>
                        
                        {/* Send Button */}
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className="w-6 h-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                        >
                          {isTyping ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 text-white" />
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
                              strokeDashoffset={`${2 * Math.PI * 8 * (1 - Math.min(inputMessage.length, 1000) / 1000)}`}
                              className="text-blue-500 transition-all duration-300"
                            />
                          </svg>
                        </div>
                        
                        {/* Send Button */}
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className="w-6 h-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                        >
                          {isTyping ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 text-white" />
                          )}
                        </button>
                      </div>
                    )}
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
