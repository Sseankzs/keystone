"use client"

import { useState, useEffect } from "react"

// Demo mode utilities for smooth hackathon presentation
interface DemoData {
  grants: any[]
  applications: any[]
  profile: any
  chatResponses: Record<string, string>
}

const DEMO_DATA: DemoData = {
  grants: [
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
  ],
  applications: [
    {
      id: "1",
      companyName: "AI Solutions Inc",
      grantTitle: "Tech Innovation Grant 2024",
      amount: "$250,000",
      status: "Under Review",
      submittedDate: "Feb 15, 2024",
      score: 85,
    },
  ],
  profile: {
    companyName: "Tech Startup Inc",
    sector: "Technology",
    description: "AI-powered business automation platform",
    headcount: "11-25",
    yearsOfOperation: "3-5",
    stage: "Series A",
    location: "San Francisco, CA",
    fundingGoal: "500k-1m",
  },
  chatResponses: {
    deadline:
      "The application deadline for this grant is March 15, 2024, at 11:59 PM EST. Make sure to submit all required documents before this date to be considered for funding.",
    amount:
      "The maximum funding amount available under this grant is $500,000 per applicant. The actual amount awarded will depend on your project scope, budget requirements, and evaluation score.",
    requirements:
      "You'll need to submit a comprehensive business plan with 3-year financial projections, technical documentation, team CVs, and market analysis. All documents should be in PDF format and clearly labeled.",
    eligible:
      "To be eligible, your company must be incorporated, have a working product or prototype, and demonstrate market traction. You should also be in the technology sector with a focus on AI or automation solutions.",
  },
}

class DemoModeManager {
  private isDemoMode = false

  constructor() {
    // Check if demo mode is enabled (only in browser environment)
    this.isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  }

  enableDemoMode() {
    this.isDemoMode = true
    if (typeof window !== "undefined") {
      localStorage.setItem("demoMode", "true")
    }
  }

  disableDemoMode() {
    this.isDemoMode = false
    if (typeof window !== "undefined") {
      localStorage.removeItem("demoMode")
    }
  }

  isEnabled(): boolean {
    return this.isDemoMode
  }

  // Simulate API delays for realistic demo
  private async simulateDelay(min = 500, max = 2000): Promise<void> {
    const delay = Math.random() * (max - min) + min
    return new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Demo data getters
  async getGrantMatches(): Promise<any[]> {
    if (!this.isDemoMode) return []
    await this.simulateDelay(1000, 2500)
    return DEMO_DATA.grants
  }

  async getProfile(): Promise<any> {
    if (!this.isDemoMode) return null
    await this.simulateDelay()
    return DEMO_DATA.profile
  }

  async getApplications(): Promise<any[]> {
    if (!this.isDemoMode) return []
    await this.simulateDelay()
    return DEMO_DATA.applications
  }

  async getChatResponse(question: string): Promise<string> {
    if (!this.isDemoMode) return ""
    await this.simulateDelay(800, 1500)

    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("deadline") || lowerQuestion.includes("when")) {
      return DEMO_DATA.chatResponses.deadline
    }
    if (lowerQuestion.includes("amount") || lowerQuestion.includes("funding")) {
      return DEMO_DATA.chatResponses.amount
    }
    if (lowerQuestion.includes("requirement") || lowerQuestion.includes("document")) {
      return DEMO_DATA.chatResponses.requirements
    }
    if (lowerQuestion.includes("eligible") || lowerQuestion.includes("qualify")) {
      return DEMO_DATA.chatResponses.eligible
    }

    return "I'd be happy to help you with that question about the grant. Could you please be more specific about what aspect you'd like to know more about?"
  }

  async processGrantUpload(): Promise<any> {
    if (!this.isDemoMode) return null
    await this.simulateDelay(2000, 4000)

    return {
      grantId: "demo-grant-" + Date.now(),
      tags: ["Technology", "AI/ML", "Startups", "Innovation", "Series A", "B2B", "SaaS", "Growth Stage"],
      checklist: [
        { item: "Business plan required", required: true },
        { item: "Financial projections (3 years)", required: true },
        { item: "Technical documentation", required: true },
        { item: "Team CVs and backgrounds", required: true },
        { item: "Market analysis", required: false },
        { item: "Customer testimonials", required: false },
      ],
      faqs: [
        {
          question: "What is the maximum funding amount available?",
          answer: "This grant provides up to $500,000 for qualifying technology startups in Series A stage.",
        },
        {
          question: "What are the eligibility criteria?",
          answer:
            "Companies must be incorporated, have a working product, and demonstrate market traction with at least $100k ARR.",
        },
      ],
    }
  }
}

export const demoMode = new DemoModeManager()

// Demo mode toggle component for development
export function DemoModeToggle() {
  const [isDemo, setIsDemo] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage after mounting
    if (typeof window !== "undefined") {
      const savedDemoMode = localStorage.getItem("demoMode") === "true"
      setIsDemo(savedDemoMode)
      if (savedDemoMode) {
        demoMode.enableDemoMode()
      } else {
        demoMode.disableDemoMode()
      }
    }
  }, [])

  const toggleDemo = () => {
    if (isDemo) {
      demoMode.disableDemoMode()
    } else {
      demoMode.enableDemoMode()
    }
    setIsDemo(!isDemo)
  }

  // Only show in development and after mounting
  if (process.env.NODE_ENV === "production" || !mounted) return null

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={toggleDemo}
        className={`px-3 py-1 text-xs rounded-full border ${
          isDemo ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"
        }`}
      >
        Demo Mode: {isDemo ? "ON" : "OFF"}
      </button>
    </div>
  )
}
