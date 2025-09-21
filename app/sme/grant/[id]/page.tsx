"use client"

import { useState, useEffect, useRef } from "react"
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
import { animated, useSpring, SpringConfig } from '@react-spring/web'
import {
  CheckCircle2,
  Send,
  ChevronDown,
  ChevronUp,
  ArrowUp,
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
  Circle,
  Paperclip,
  File
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CircularProgress } from "@/components/ui/circular-progress"

// Island modes enum
enum IslandMode {
  DEFAULT = 'Default',
  TODO_ONLY = 'TodoOnly',
  FULL_EXPANDED = 'FullExpanded', // Keeping this for the type definition even if not used.
}

// Scene type definitions
type SharedIslandScene<Name extends string> = {
  name: Name
}

type TodoOnlyIslandScene<Name extends string> = SharedIslandScene<Name> & {
  mode: IslandMode.TODO_ONLY
  content: React.ReactNode
}

type FullExpandedIslandScene<Name extends string> = SharedIslandScene<Name> & {
  mode: IslandMode.FULL_EXPANDED
  left: React.ReactNode
  right: React.ReactNode
}

type IslandScene<Name extends string = string> =
  | TodoOnlyIslandScene<Name>
  // | FullExpandedIslandScene<Name> // Removed as per previous instructions

// Props type for Dynamic Island
type DynamicIslandProps<Name extends string, T extends IslandScene<Name>> = {
  scenes: T[]
  currentSceneName: T['name'] | null
}

// Animation configurations
const flatMove: SpringConfig = {
  tension: 300,
  mass: 0.1,
}

// Mock grants list for sidebar - in real app, this would come from API
const MOCK_GRANTS = [
  {
    id: "1",
    title: "Malaysia Digital Economy Corporation (MDEC) Digital Innovation Fund",
    amount: "RM 2.5M",
    date: "Mar 15",
    assignee: "Innovation Team",
    status: "active",
    progress: 85,
    logo: "🇲🇾",
    count: 1,
    isSelected: true,
  },
  {
    id: "2", 
    title: "Malaysian Technology Development Corporation (MTDC) Technology Commercialisation Fund",
    amount: "RM 750k",
    date: "Apr 20",
    assignee: "Research Division",
    status: "active",
    progress: 60,
    logo: "🔬",
    count: 2,
  },
  {
    id: "3",
    title: "Malaysian Green Technology Corporation (MGTC) Green Technology Fund",
    amount: "RM 1.2M",
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
    title: "Malaysia Digital Economy Corporation (MDEC) Digital Innovation Fund",
    issuer: "Malaysia Digital Economy Corporation",
    maxAmount: "RM 2,500,000",
    deadline: "2025-03-15",
    badge: "Likely",
    score: 85,
    whyItMatches: "Strong digital innovation focus aligns with your AI/ML development goals in Malaysia",
    dealbreakers: "Requires Malaysian-registered SME or startup",
    progress: { current: 2, total: 5 },
    tags: ["Digital Technology", "Innovation", "SMEs", "Startups", "AI/ML", "Fintech"],
    status: "Open",
    description: "The MDEC Digital Innovation Fund supports Malaysian SMEs and startups with breakthrough digital innovations and high growth potential. This program provides grant funding to help companies scale their digital solutions and contribute to Malaysia's digital economy transformation.",
    playbook: "Digital Innovation Grant Strategy",
    eligibility: [
      "Malaysian-registered SMEs or startups",
      "Technology Readiness Level 5-8",
      "Strong digital innovation component",
      "Clear market potential in Malaysia",
      "Scalable digital business model"
    ],
    benefits: [
      "Up to RM 2.5M in grant funding",
      "Access to MDEC ecosystem and market access programs",
      "Business coaching and mentoring",
      "Networking opportunities with industry players"
    ],
    criteria: [
      "Success criteria: Demonstrate TRL 5-8 with working prototype and validation results for the Malaysian market",
      "Champion: MDEC evaluation panel scheduled for next quarter",
      "Risks: Competition in the digital innovation space in Malaysia",
    ],
    nextSteps: [
      {
        id: 1,
        text: "Complete Technology Readiness Assessment and gather evidence of current development stage for digital solution",
        completed: true,
        note: "TRL assessment completed at level 6...",
      },
      {
        id: 2,
        text: "Prepare detailed market analysis showing digital innovation potential and market need in Malaysia",
        completed: false,
      },
      {
        id: 3,
        text: "Create 3-year financial projections including funding use plan for Malaysian operations",
        completed: false,
        dueDate: "Due in 2 weeks",
      },
    ],
    suggestedSteps: [
      "Research MDEC digital economy initiatives and align your solution with national priorities",
      "Connect with MDEC mentors through their network for guidance on application strategies",
    ]
  },
  "2": {
    id: "2",
    title: "Malaysian Technology Development Corporation (MTDC) Technology Commercialisation Fund",
    issuer: "Malaysian Technology Development Corporation",
    maxAmount: "RM 750,000",
    deadline: "2025-04-20",
    badge: "Active",
    score: 60,
    whyItMatches: "Your technology has strong commercialisation potential in key Malaysian industries.",
    dealbreakers: "Requires proven technology with commercial potential",
    progress: { current: 3, total: 6 },
    tags: ["Technology Commercialisation", "R&D", "Manufacturing", "Engineering", "Biotech"],
    status: "Open",
    description: "The MTDC Technology Commercialisation Fund supports Malaysian companies in commercializing their research and development outcomes. This program provides funding to bridge the gap between R&D and market deployment, helping companies bring innovative technologies to market.",
    playbook: "Technology Commercialisation Strategy",
    eligibility: [
      "Malaysian-registered technology companies",
      "Proven technology with commercial potential",
      "Novel technology or significant improvement",
      "Clear commercial market opportunity",
      "Viable commercialization strategy"
    ],
    benefits: [
      "Up to RM 750k in commercialisation funding",
      "Access to MTDC expertise and network",
      "Support for market entry and scale-up",
      "Mentorship from industry experts"
    ],
    criteria: [
      "Success criteria: Demonstrate clear path to market and revenue generation within 2-3 years",
      "Champion: MTDC evaluation committee scheduled for next month",
      "Risks: Market acceptance for novel technology and competitive landscape",
    ],
    nextSteps: [
      {
        id: 1,
        text: "Develop a comprehensive commercialisation plan, including market entry strategy and sales projections",
        completed: false,
      },
      {
        id: 2,
        text: "Prepare intellectual property (IP) strategy and secure necessary protections",
        completed: false,
      },
      {
        id: 3,
        text: "Conduct pilot testing or validation with potential customers in target industries",
        completed: false,
        dueDate: "Due in 3 weeks",
      },
    ],
    suggestedSteps: [
      "Engage with MTDC business advisors to refine your commercialisation strategy",
      "Explore potential industry partnerships for technology adoption and distribution",
    ]
  },
  "3": {
    id: "3",
    title: "Malaysian Green Technology Corporation (MGTC) Green Technology Fund",
    issuer: "Malaysian Green Technology Corporation",
    maxAmount: "RM 1,200,000",
    deadline: "2025-05-10",
    badge: "Pending",
    score: 25,
    whyItMatches: "Your green technology solution contributes to Malaysia's sustainability goals.",
    dealbreakers: "Requires environmentally friendly technology with clear environmental benefits",
    progress: { current: 1, total: 4 },
    tags: ["Green Technology", "Sustainability", "Renewable Energy", "Environmental", "Clean Tech"],
    status: "Upcoming",
    description: "The MGTC Green Technology Fund supports Malaysian companies developing environmentally friendly technologies and solutions. This program provides funding to accelerate the adoption of green technologies and contribute to Malaysia's sustainability goals and carbon reduction targets.",
    playbook: "Green Technology Funding Strategy",
    eligibility: [
      "Malaysian-registered green technology companies",
      "Environmentally friendly technology",
      "Green innovation with environmental benefits",
      "Clear environmental impact potential",
      "Sustainable business model"
    ],
    benefits: [
      "Up to RM 1.2M in green technology funding",
      "Access to MGTC initiatives and policy support",
      "Opportunities for collaboration with other green technology players",
      "Showcase your solution at national green events"
    ],
    criteria: [
      "Success criteria: Quantifiable environmental impact (e.g., carbon reduction, waste reduction)",
      "Champion: MGTC technical committee review in two months",
      "Risks: Regulatory changes in green technology and public acceptance of new solutions",
    ],
    nextSteps: [
      {
        id: 1,
        text: "Conduct a detailed environmental impact assessment of your technology and quantify its benefits",
        completed: false,
      },
      {
        id: 2,
        text: "Prepare a sustainability report outlining your company's commitment and practices",
        completed: false,
      },
      {
        id: 3,
        text: "Develop a community engagement plan to promote the adoption of your green solution",
        completed: false,
        dueDate: "Due in 4 weeks",
      },
    ],
    suggestedSteps: [
      "Liaise with MGTC experts to understand the latest green technology policies and incentives",
      "Participate in green technology exhibitions and forums to network and showcase your solution",
    ]
  }
}

// Grant-specific eligibility rules
const getEligibilityRules = (grantId: string) => {
  const rules = {
    "1": [
      {
        id: "1",
        rule: "Malaysian-registered SMEs or startups",
        status: "uncertain" as const,
        reason: "Company registration needs verification"
      },
      {
        id: "2",
        rule: "Technology Readiness Level 5-8",
        status: "uncertain" as const,
        reason: "TRL assessment required for digital solution"
      },
      {
        id: "3",
        rule: "Strong digital innovation component",
        status: "pass" as const,
        reason: "AI/ML innovation matches requirement"
      },
      {
        id: "4",
        rule: "Clear market potential in Malaysia",
        status: "uncertain" as const,
        reason: "Market analysis needed for Malaysian market"
      },
      {
        id: "5",
        rule: "Scalable digital business model",
        status: "pass" as const,
        reason: "Digital business model is scalable"
      },
    ],
    "2": [
      {
        id: "1",
        rule: "Malaysian-registered technology companies",
        status: "uncertain" as const,
        reason: "Company registration needs verification"
      },
      {
        id: "2",
        rule: "Proven technology with commercial potential",
        status: "uncertain" as const,
        reason: "Technology validation and market fit assessment required"
      },
      {
        id: "3",
        rule: "Novel technology or significant improvement",
        status: "pass" as const,
        reason: "Innovative technology identified"
      },
      {
        id: "4",
        rule: "Clear commercial market opportunity",
        status: "uncertain" as const,
        reason: "Detailed market opportunity analysis needed"
      },
      {
        id: "5",
        rule: "Viable commercialization strategy",
        status: "pass" as const,
        reason: "Initial commercialization strategy drafted"
      },
    ],
    "3": [
      {
        id: "1",
        rule: "Malaysian-registered green technology companies",
        status: "uncertain" as const,
        reason: "Company registration needs verification"
      },
      {
        id: "2",
        rule: "Environmentally friendly technology",
        status: "uncertain" as const,
        reason: "Environmental impact assessment required"
      },
      {
        id: "3",
        rule: "Green innovation with environmental benefits",
        status: "pass" as const,
        reason: "Identified green innovation with potential benefits"
      },
      {
        id: "4",
        rule: "Clear environmental impact potential",
        status: "uncertain" as const,
        reason: "Quantifiable environmental impact analysis needed"
      },
      {
        id: "5",
        rule: "Sustainable business model",
        status: "pass" as const,
        reason: "Sustainable business model outlined"
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
        title: "Digital Solution Readiness Assessment",
        description: "Complete TRL assessment for your digital solution and provide evidence of current development stage in Malaysia.",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "2",
        title: "Malaysian Market Analysis & Digital Impact",
        description: "Prepare detailed market analysis showing digital innovation potential and market need in Malaysia.",
        completed: false,
        category: "business" as const,
        required: true
      },
      {
        id: "3",
        title: "Financial Projections for Malaysian Operations",
        description: "Create 3-year financial projections including funding use plan for your Malaysian operations.",
        completed: false,
        category: "financial" as const,
        required: true
      },
      {
        id: "4",
        title: "Digital Innovation Description & Competitive Advantages",
        description: "Write detailed technical description of your digital innovation and competitive advantages in the Malaysian market.",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "5",
        title: "Team & Company Profile (Malaysia)",
        description: "Prepare team CVs and company background documentation relevant to your Malaysian entity.",
        completed: false,
        category: "business" as const,
        required: true
      },
    ],
    "2": [
      {
        id: "1",
        title: "Technology Commercialisation Plan (Malaysia)",
        description: "Develop a comprehensive technology commercialisation plan, including market entry strategy and sales projections for Malaysia.",
        completed: false,
        category: "business" as const,
        required: true
      },
      {
        id: "2",
        title: "Intellectual Property (IP) Strategy & Protection",
        description: "Prepare intellectual property (IP) strategy and secure necessary protections for your technology in Malaysia.",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "3",
        title: "Pilot Testing & Customer Validation (Malaysia)",
        description: "Conduct pilot testing or validation with potential customers in target industries in Malaysia.",
        completed: false,
        category: "business" as const,
        required: true
      },
      {
        id: "4",
        title: "Technical Documentation & Specifications",
        description: "Provide detailed technical documentation and specifications of your technology.",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "5",
        title: "Team & Management Profile",
        description: "Prepare team CVs and management background documentation for your technology commercialisation.",
        completed: false,
        category: "business" as const,
        required: true
      },
    ],
    "3": [
      {
        id: "1",
        title: "Environmental Impact Assessment (EIA) for Green Technology",
        description: "Conduct a detailed environmental impact assessment of your green technology and quantify its benefits.",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "2",
        title: "Sustainability Report & Practices",
        description: "Prepare a sustainability report outlining your company's commitment and green practices.",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "3",
        title: "Community Engagement & Adoption Plan",
        description: "Develop a community engagement plan to promote the adoption of your green solution in Malaysia.",
        completed: false,
        category: "business" as const,
        required: true
      },
      {
        id: "4",
        title: "Green Technology Certification & Compliance",
        description: "Obtain necessary green technology certifications and ensure compliance with Malaysian environmental regulations.",
        completed: false,
        category: "documents" as const,
        required: true
      },
      {
        id: "5",
        title: "Team & Green Initiatives Profile",
        description: "Prepare team CVs and highlight experience in green technology and sustainability initiatives.",
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

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTodoCollapsed, setIsTodoCollapsed] = useState(false)

  // Dynamic Island State Management
  const [currentSceneName, setCurrentSceneName] = useState<string | null>('default')
  const [currentMode, setCurrentMode] = useState<IslandMode>(IslandMode.DEFAULT)
  const transitionModeRef = useRef<string | null>(null)
  const previousSceneRef = useRef<IslandScene<string> | null>(null)
  const [isPillActive, setIsPillActive] = useState(false)
  const [expansionStage, setExpansionStage] = useState<0 | 1 | 2>(0) // 0: collapsed, 1: todo only, 2: full
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMultiLineTask, setIsMultiLineTask] = useState(false);
  const taskTextRef = useRef<HTMLSpanElement>(null);

  // Next steps functionality from momentum design
  const [nextSteps, setNextSteps] = useState(currentGrant?.nextSteps || [])
  const [newStep, setNewStep] = useState("")
  const [showSuggested, setShowSuggested] = useState(true)

  // Scene definitions for dynamic island
  const scenes: TodoOnlyIslandScene<string>[] = [ // Changed type to only TodoOnlyIslandScene
    {
      name: 'todoOnly',
      mode: IslandMode.TODO_ONLY,
      content: (() => {
        const firstIncompleteTask = nextSteps.find(step => !step.completed);
        return (
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
              {firstIncompleteTask ? (
                <span ref={taskTextRef} className="text-sm font-medium text-white text-left flex-1 min-w-0 max-h-[60px] overflow-hidden leading-tight">
                  {firstIncompleteTask.text}
                </span>
              ) : (
                <span className="text-sm font-medium text-white text-left flex-1 min-w-0">All tasks completed!</span>
              )}
            </div>
            <div className="flex items-center flex-shrink-0">
              <ChevronRight className="h-4 w-4 text-white/60" />
            </div>
          </div>
        );
      })(),
    },
    // Removed the FULL_EXPANDED scene as it's no longer needed.
  ]

  // Handle scene transitions
  useEffect(() => {
    const previousScene = previousSceneRef.current
    previousSceneRef.current = scenes.find(({ name }) => name === currentSceneName) ?? null

    transitionModeRef.current = `from${previousScene?.mode ?? IslandMode.DEFAULT
      }To${scenes.find(({ name }) => name === currentSceneName)?.mode ?? IslandMode.DEFAULT}`

    if (currentSceneName === null) {
      setCurrentMode(IslandMode.DEFAULT)
      return
    }

    const currentScene = scenes.find(({ name }) => name === currentSceneName)
    setCurrentMode(currentScene?.mode ?? IslandMode.DEFAULT)
  }, [currentSceneName])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Effect to determine if the task text is multi-line
  useEffect(() => {
    if (taskTextRef.current && currentMode === IslandMode.TODO_ONLY) {
      setIsMultiLineTask(taskTextRef.current.scrollHeight > taskTextRef.current.clientHeight);
    }
  }, [taskTextRef.current, currentMode, nextSteps]); // Re-run when text content or mode changes

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setUploadedFiles(prev => [...prev, ...newFiles])
      setIsUploading(true)
      
      // Simulate file upload process
      setTimeout(() => {
        setIsUploading(false)
      }, 1000)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Main Dynamic Island Component
  const DynamicIsland = () => {
    const currentScene = scenes.find(({ name }) => name === currentSceneName)

    if (currentSceneName !== null && currentScene === undefined && currentSceneName !== 'default') {
      throw Error(`Could not find the scene. SceneName: ${currentSceneName}`)
    }

    // Main island size animation with three stages
    const dynamicIslandStyles = useSpring(
      currentMode === IslandMode.TODO_ONLY
        ? {
            config: { // Bounce effect on expansion
              tension: 400, // Increased tension for a snappier feel
              mass: 0.8,    // Reduced mass for more bounce
              friction: 20, // Added friction to dampen the bounce slightly
            },
            width: 380, // Width for TodoOnly mode
            height: isMultiLineTask ? 100 : 60, // Dynamic height based on multiline task
            borderRadius: isMultiLineTask ? '20px' : '40px', // Rounded rectangle for multiline
            delay: transitionModeRef.current === 'fromDefaultToTodoOnly' ? 0 : 100,
          }
        : {
            // Default mode (collapsed) - smoother collapse
            config: { tension: 200, friction: 25 }, // Adjusted for a suitable closing animation
            width: 200, // Reverted to pill shape
            height: 44,
            borderRadius: '22px',
            delay: transitionModeRef.current === 'fromTodoOnlyToDefault' ? 0 : 100,
          }
    )

    // Content fade animation with blur effects
    const contentStyles = useSpring(
      currentMode === IslandMode.TODO_ONLY
        ? {
            config: {
              duration: 150,
            },
            opacity: 1,
            filter: 'blur(0px)',
            transform: 'scale(1)',
            delay: 50,
          }
        : {
            // Default mode (collapsed)
            config: {
              duration: 150,
            },
            opacity: 0,
            filter: 'blur(5px)',
            transform: 'scale(0.9)',
          }
    )

    // Default pill content animation
    const pillContentStyles = useSpring(
      currentMode === IslandMode.DEFAULT
        ? {
            config: {
              duration: 200,
            },
            opacity: 1,
            transform: 'scale(1)',
            transition: 'transform 0.15s ease-out'
          }
        : {
            config: {
              duration: 150,
            },
            opacity: 0,
            transform: 'scale(0.95)',
            transition: 'transform 0.15s ease-out'
          }
    )

    return (
      <div className="relative">
        {/* Dynamic Island Container */}
        <animated.div
          className="relative overflow-hidden cursor-pointer bg-black shadow-2xl"
          style={dynamicIslandStyles}
          onClick={handlePillClick}
        >
          {/* Default Mode (Collapsed Pill) */}
          {currentMode === IslandMode.DEFAULT && (
            <animated.div
              className="flex items-center justify-between w-full h-full px-4"
              style={{
                ...pillContentStyles,
                transform: isPillActive ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.15s ease-out'
              }}
            >
              <div className="flex items-center gap-3">
                {/* Removed Building2 icon as requested */}
              </div>
              
              {/* Circular Progress */}
              <div className="relative w-6 h-6">
                {(() => {
                  const completedTasks = nextSteps.filter(s => s.completed).length;
                  const totalTasks = nextSteps.length;
                  const incompleteTasksCount = totalTasks - completedTasks;

                  const progress = completedTasks / Math.max(totalTasks, 1);
                  
                  // Dynamic color based on incomplete tasks, if all are complete, green.
                  const taskColor = incompleteTasksCount === 0 ? '#10B981' : '#F59E0B'; // Green if 0 incomplete, else orange

                  return (
                    <>
                      <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="2"
                          fill="none"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke={taskColor}
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 10}`}
                          strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress)}`}
                          className="transition-all duration-300 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-medium" style={{ color: taskColor }}>
                          {incompleteTasksCount}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </animated.div>
          )}

          {/* Todo Only Mode */}
          {currentMode === IslandMode.TODO_ONLY && (
            <animated.div
              className="flex items-center w-full h-full"
              style={contentStyles}
            >
              {(currentScene as TodoOnlyIslandScene<string>)?.content}
            </animated.div>
          )}
          {/* Removed Full Expanded Mode as it is no longer needed */}
        </animated.div>
      </div>
    );
  };

  const handlePillClick = () => {
    setIsPillActive(true);

    let nextStage: 0 | 1;
    if (expansionStage === 0) {
      // From Default (collapsed): go to TodoOnly
      nextStage = 1; 
    } else { 
      // From TodoOnly: go back to Default (collapsed)
      nextStage = 0;
    }
    setExpansionStage(nextStage as 0 | 1 | 2); // Cast back to original type for now

    // Set scene based on expansion stage
    switch (nextStage) {
      case 0:
        setCurrentSceneName('default');
        setCurrentMode(IslandMode.DEFAULT);
        break;
      case 1:
        setCurrentSceneName('todoOnly');
        setCurrentMode(IslandMode.TODO_ONLY);
        break;
      // Remove case 2 (FullExpanded) as it's no longer a state
    }

    // Reset active state after animation
    setTimeout(() => {
      setIsPillActive(false);
    }, 150);
  };

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
  };

  const toggleChecklistItem = (id: string) => {
    // In a real app, this would update the state and persist to backend
    console.log(`Toggling checklist item ${id}`)
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  };

  // Momentum design functionality
  const handleStepToggle = (id: number) => {
    setNextSteps((prev) => prev.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step)))
  };

  const addNewStep = () => {
    if (newStep.trim()) {
    const newId = Math.max(...nextSteps.map((s) => s.id)) + 1
      setNextSteps((prev) => [...prev, { id: newId, text: newStep, completed: false }])
      setNewStep("")
    }
  };

  const addSuggestedStep = (stepText: string) => {
    const newId = Math.max(...nextSteps.map((s) => s.id)) + 1
    setNextSteps((prev) => [...prev, { id: newId, text: stepText, completed: false }])
  };


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
              <span className="font-medium text-gray-900 font-serif">Keystone</span>
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
        <div className="flex-1 flex flex-col min-w-0">
          {/* Dynamic Island - Always Visible */}
          <div className="flex-shrink-0 p-8 pt-2 pb-0">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-center">
                <DynamicIsland />
              </div>
            </div>
          </div>

          {/* Scrollable Chat Area */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="p-8 pb-6 max-w-5xl mx-auto">
              {/* Empty State - Centered when no conversation */}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-128">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask about <em>{grant.title}</em></h3>
                    <p className="text-gray-600 text-sm">Get personalized guidance from our AI assistant</p>
                  </div>
                </div>
              )}

              {/* Chat Messages - Only show when there are messages */}
              {messages.length > 0 && (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "user" ? (
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 bg-blue-600 text-white ${
                          message.content.split('\n').length === 1 && message.content.length < 50 
                            ? 'rounded-full' 
                            : 'rounded-2xl'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">{message.content}</p>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-full">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Floating Input - Fixed at Bottom */}
          <div className="sticky bottom-0 bg-gray-50 p-4">
            {/* Subtle gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-gray-50 to-gray-50 pointer-events-none"></div>

            <div className="max-w-5xl mx-auto">
              <div className="relative">
                  <div className={`relative bg-gray-100 transition-all duration-200 ${
                    inputMessage.split('\n').length === 1 && inputMessage.length < 50 ? 'rounded-full' : 'rounded-2xl'
                  }`}>
                    {/* File Upload Button - Left Side */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer w-8 h-8 flex items-center justify-center transition-all duration-200 hover:scale-105"
                      >
                        {isUploading ? (
                          <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus className="h-5 w-5 text-gray-500 hover:text-blue-600 transition-colors duration-200" />
                        )}
                      </label>
                    </div>

                    <Textarea
                      placeholder="Ask about eligibility, requirements, or next steps..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      rows={inputMessage.split('\n').length > 1 ? Math.min(inputMessage.split('\n').length, 4) : 1}
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none placeholder:text-gray-500 text-gray-900 py-3 pl-12 pr-5"
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

                    {/* Uploaded Files Display */}
                    {uploadedFiles.length > 0 && (
                      <div className="px-3 py-2 bg-gray-50">
                        <div className="flex flex-wrap gap-2">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            >
                              <File className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700 truncate max-w-[150px]">
                                {file.name}
                              </span>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Controls - Position based on content */}
                    {inputMessage.split('\n').length > 2 ? (
                      // Expanded mode: Send Button only
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className="w-6 h-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                        >
                          {isTyping ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-white" />
                          )}
                        </button>
                      </div>
                    ) : (
                      // Single line mode: Send Button only
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className="w-6 h-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
                        >
                          {isTyping ? (
                            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-white" />
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
  );
}