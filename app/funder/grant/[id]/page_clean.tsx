"use client"

import React, { useState } from "react"
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
    criteria: [
      "Breakthrough innovation with high growth potential",
      "Technology Readiness Level 5-8",
      "EU-based company or willing to establish EU presence",
      "Clear path to market and scalability",
      "Strong team with relevant expertise"
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
        title: "Business Plan",
        description: "Comprehensive business plan including market analysis and financial projections",
        completed: false,
        category: "business" as const,
        required: true
      },
      {
        id: "3",
        title: "Financial Statements",
        description: "Audited financial statements for the last 2 years",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "4",
        title: "Team CVs",
        description: "Detailed CVs of key team members",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "5",
        title: "Innovation Documentation",
        description: "Technical documentation and patents related to the innovation",
        completed: false,
        category: "documents" as const,
        required: false
      },
      {
        id: "6",
        title: "Market Research",
        description: "Independent market research and competitive analysis",
        completed: false,
        category: "business" as const,
        required: false
      }
    ]
  }
  return checklists[grantId as keyof typeof checklists] || []
}

export default function GrantDetails() {
  const params = useParams()
  const grantId = params.id as string
  const grant = GRANT_DATA[grantId as keyof typeof GRANT_DATA]
  const currentGrant = GRANT_DATA[grantId as keyof typeof GRANT_DATA]

  // State for interactive elements
  const [nextSteps, setNextSteps] = useState([
    { id: "1", text: "Complete Technology Readiness Assessment and gather evidence of current development stage", completed: false },
    { id: "2", text: "Prepare comprehensive business plan with market analysis", completed: false },
    { id: "3", text: "Gather all required financial documentation", completed: false },
    { id: "4", text: "Submit application before deadline", completed: false }
  ])
  const [newStep, setNewStep] = useState("")
  const [showSuggested, setShowSuggested] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "assistant" as const,
      text: "I can help you understand this grant better. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const eligibilityRules = getEligibilityRules(grantId)
  const checklistItems = getChecklistItems(grantId)

  const handleStepToggle = (stepId: string) => {
    setNextSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, completed: !step.completed }
          : step
      )
    )
  }

  const addNewStep = () => {
    if (newStep.trim()) {
      const newId = String(nextSteps.length + 1)
      setNextSteps(prev => [...prev, { id: newId, text: newStep.trim(), completed: false }])
      setNewStep("")
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: String(messages.length + 1),
      sender: "user" as const,
      text: newMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: String(messages.length + 2),
        sender: "assistant" as const,
        text: "Based on your question, I can help you understand the eligibility requirements and next steps for this grant. Would you like me to elaborate on any specific aspect?",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  if (!grant) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Grant Not Found</h1>
            <p className="text-gray-600 mb-6">The grant you're looking for doesn't exist.</p>
            <Link href="/funder/dashboard">
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
      {/* Header */}
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
              <Link key={grantItem.id} href={`/funder/grant/${grantItem.id}`}>
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
                        <div className="marquee-content">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 font-mono">GRANT-{grantItem.id}</span>
                            <span className="text-sm font-medium text-gray-900">{grantItem.title}</span>
                          </div>
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
            {/* Grant Overview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentGrant?.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{currentGrant?.issuer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{currentGrant?.maxAmount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(currentGrant?.deadline || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Fund
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grant Description</h2>
                <p className="text-gray-700 leading-relaxed">{currentGrant?.description}</p>
              </div>
            </div>

            {/* Auto-generated Tags & Sectors */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-blue-100 rounded">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Auto-generated Tags & Sectors</h2>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentGrant?.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Target Sectors</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Technology</Badge>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Innovation</Badge>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">SMEs</Badge>
                      <Badge variant="outline" className="bg-cyan-100 text-cyan-800 border-cyan-200">Startups</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eligibility Rules */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Eligibility Rules</h2>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  {eligibilityRules.map((rule, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        rule.status === 'pass' ? 'bg-green-100' :
                        rule.status === 'uncertain' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        {rule.status === 'pass' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : rule.status === 'uncertain' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{rule.rule}</p>
                        <p className="text-sm text-gray-600 mt-1">{rule.reason}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Required Documents</h2>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-3">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.required ? 'border-red-500' : 'border-gray-300'
                        }`}>
                          {item.required && <CheckCircle className="w-3 h-3 text-red-500" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.title}</span>
                        {item.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SME Engagement Summary */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-orange-100 rounded">
                  <Building className="h-4 w-4 text-orange-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">SME Engagement Summary</h2>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                    <div className="text-sm text-gray-600">SMEs Matched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">8</div>
                    <div className="text-sm text-gray-600">Applications Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                    <div className="text-sm text-gray-600">Under Review</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
                      <p className="text-sm text-gray-600">Last application received 2 days ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View All Applications
                    </Button>
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
