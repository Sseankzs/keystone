// Mock API client for frontend development
// This will be replaced with real API integration once backend is ready

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface GrantMatch {
  id: string
  title: string
  provider: string
  amount: string
  score: number
  status: string
  deadline: string
  description: string
  whyMatch: string
  requirements: Array<{
    item: string
    completed: boolean
  }>
  tags: string[]
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: Array<{
    id: string
    text: string
    source: string
    page?: number
  }>
}

interface GrantIngestResponse {
  grantId: string
  tags: string[]
  checklist: Array<{
    item: string
    required: boolean
  }>
  faqs?: Array<{
    question: string
    answer: string
  }>
}

const mockGrantMatches: GrantMatch[] = [
  {
    id: "1",
    title: "Small Business Innovation Research (SBIR) Grant",
    provider: "National Science Foundation",
    amount: "$50,000 - $500,000",
    score: 95,
    status: "Open",
    deadline: "2024-03-15",
    description: "Funding for small businesses to engage in research and development with commercialization potential.",
    whyMatch: "Perfect match for your AI/ML technology focus and early-stage development needs.",
    requirements: [
      { item: "Business registration", completed: true },
      { item: "Technical proposal", completed: false },
      { item: "Budget breakdown", completed: false },
      { item: "Team qualifications", completed: true },
    ],
    tags: ["Technology", "R&D", "Small Business", "Innovation"],
  },
  {
    id: "2",
    title: "Green Technology Accelerator Fund",
    provider: "Department of Energy",
    amount: "$25,000 - $100,000",
    score: 87,
    status: "Open",
    deadline: "2024-04-30",
    description: "Supporting clean energy and environmental technology startups.",
    whyMatch: "Your sustainability focus aligns with green technology initiatives.",
    requirements: [
      { item: "Environmental impact assessment", completed: false },
      { item: "Prototype demonstration", completed: true },
      { item: "Market analysis", completed: false },
    ],
    tags: ["Green Tech", "Environment", "Clean Energy", "Startup"],
  },
  {
    id: "3",
    title: "Women-Owned Small Business Grant",
    provider: "Small Business Administration",
    amount: "$10,000 - $75,000",
    score: 78,
    status: "Open",
    deadline: "2024-05-20",
    description: "Supporting women entrepreneurs in growing their businesses.",
    whyMatch: "Matches your business ownership profile and growth stage.",
    requirements: [
      { item: "Women ownership certification", completed: true },
      { item: "Business plan", completed: true },
      { item: "Financial statements", completed: false },
    ],
    tags: ["Women-Owned", "Small Business", "Entrepreneurship"],
  },
]

const mockChatResponses = [
  "Based on the grant requirements, you'll need to submit a detailed technical proposal outlining your innovation's potential impact and commercialization strategy.",
  "The application deadline is firm, but you can request an extension under exceptional circumstances by contacting the program officer directly.",
  "Eligible expenses include personnel costs, equipment, materials, and indirect costs up to 25% of the total budget.",
  "Previous awardees have found success by clearly demonstrating market need and competitive advantage in their proposals.",
]

class MockApiClient {
  private simulateDelay(ms = 1000) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async mockResponse<T>(data: T, delay = 1000): Promise<ApiResponse<T>> {
    await this.simulateDelay(delay)
    return {
      success: true,
      data,
    }
  }

  // Authentication endpoints (mock)
  async login(email: string, password: string) {
    await this.simulateDelay(800)
    return {
      success: true,
      data: {
        token: "mock-jwt-token",
        user: {
          id: "1",
          email,
          name: "Demo User",
          type: email.includes("funder") ? "funder" : "sme",
        },
      },
    }
  }

  async register(userData: any) {
    await this.simulateDelay(1200)
    return {
      success: true,
      data: {
        token: "mock-jwt-token",
        user: {
          id: "1",
          ...userData,
          type: userData.userType || "sme",
        },
      },
    }
  }

  async logout() {
    await this.simulateDelay(300)
    return { success: true }
  }

  // Grant ingestion endpoint (mock)
  async ingestGrant(formData: FormData): Promise<ApiResponse<GrantIngestResponse>> {
    await this.simulateDelay(2000)
    return {
      success: true,
      data: {
        grantId: `grant-${Date.now()}`,
        tags: ["Technology", "Innovation", "Small Business", "R&D"],
        checklist: [
          { item: "Business registration documents", required: true },
          { item: "Technical proposal (max 10 pages)", required: true },
          { item: "Budget breakdown and justification", required: true },
          { item: "Team member CVs", required: true },
          { item: "Letters of support", required: false },
          { item: "Intellectual property documentation", required: false },
        ],
        faqs: [
          {
            question: "What is the maximum funding amount?",
            answer:
              "The maximum funding amount varies by phase, with Phase I up to $500,000 and Phase II up to $2,000,000.",
          },
          {
            question: "How long is the application review process?",
            answer: "The review process typically takes 6-8 months from submission deadline to award notification.",
          },
        ],
      },
    }
  }

  // Grant matching endpoint (mock)
  async matchGrants(profile: any, goal: string): Promise<ApiResponse<GrantMatch[]>> {
    await this.simulateDelay(1500)
    return this.mockResponse(mockGrantMatches)
  }

  // Chat/Ask endpoint (mock)
  async askQuestion(grantId: string, question: string): Promise<ApiResponse<ChatMessage>> {
    await this.simulateDelay(800)
    const randomResponse = mockChatResponses[Math.floor(Math.random() * mockChatResponses.length)]

    return {
      success: true,
      data: {
        id: `msg-${Date.now()}`,
        type: "assistant",
        content: randomResponse,
        timestamp: new Date(),
        citations: [
          {
            id: "cite-1",
            text: "Grant guidelines section 3.2",
            source: "Program Solicitation Document",
            page: 12,
          },
        ],
      },
    }
  }

  // Profile endpoints (mock)
  async saveProfile(profileData: any) {
    return this.mockResponse({ id: "profile-1", ...profileData }, 800)
  }

  async getProfile() {
    return this.mockResponse(
      {
        id: "profile-1",
        companyName: "Demo Company",
        industry: "Technology",
        stage: "Early Stage",
      },
      500,
    )
  }

  async saveFunderProfile(profileData: any) {
    return this.mockResponse({ id: "funder-profile-1", ...profileData }, 800)
  }

  async getFunderProfile() {
    return this.mockResponse(
      {
        id: "funder-profile-1",
        organizationName: "Demo Foundation",
        focusAreas: ["Technology", "Innovation"],
        totalBudget: "$10,000,000",
      },
      500,
    )
  }

  // Grant management endpoints (mock)
  async getGrants() {
    return this.mockResponse(
      [
        {
          id: "1",
          title: "Tech Innovation Grant 2024",
          status: "Active",
          applications: 45,
          budget: "$500,000",
        },
      ],
      600,
    )
  }

  async getGrant(grantId: string) {
    return this.mockResponse(
      {
        id: grantId,
        title: "Tech Innovation Grant 2024",
        description: "Supporting innovative technology startups",
        status: "Active",
        applications: 45,
        budget: "$500,000",
      },
      400,
    )
  }

  async updateGrant(grantId: string, grantData: any) {
    return this.mockResponse({ id: grantId, ...grantData }, 700)
  }

  async deleteGrant(grantId: string) {
    return this.mockResponse({ deleted: true }, 500)
  }

  // Application endpoints (mock)
  async getApplications() {
    return this.mockResponse(
      [
        {
          id: "app-1",
          grantTitle: "SBIR Phase I",
          status: "Under Review",
          submittedDate: "2024-01-15",
        },
      ],
      600,
    )
  }

  async submitApplication(applicationData: any) {
    return this.mockResponse(
      {
        id: `app-${Date.now()}`,
        ...applicationData,
        status: "Submitted",
      },
      1000,
    )
  }

  async updateApplicationStatus(applicationId: string, status: string) {
    return this.mockResponse({ id: applicationId, status }, 400)
  }
}

export const apiClient = new MockApiClient()

export const api = {
  // Authentication
  auth: {
    login: apiClient.login.bind(apiClient),
    register: apiClient.register.bind(apiClient),
    logout: apiClient.logout.bind(apiClient),
  },

  // SME operations
  sme: {
    saveProfile: apiClient.saveProfile.bind(apiClient),
    getProfile: apiClient.getProfile.bind(apiClient),
    matchGrants: apiClient.matchGrants.bind(apiClient),
    askQuestion: apiClient.askQuestion.bind(apiClient),
  },

  // Funder operations
  funder: {
    saveProfile: apiClient.saveFunderProfile.bind(apiClient),
    getProfile: apiClient.getFunderProfile.bind(apiClient),
    ingestGrant: apiClient.ingestGrant.bind(apiClient),
    getGrants: apiClient.getGrants.bind(apiClient),
    getGrant: apiClient.getGrant.bind(apiClient),
    updateGrant: apiClient.updateGrant.bind(apiClient),
    deleteGrant: apiClient.deleteGrant.bind(apiClient),
  },

  // Applications
  applications: {
    getAll: apiClient.getApplications.bind(apiClient),
    submit: apiClient.submitApplication.bind(apiClient),
    updateStatus: apiClient.updateApplicationStatus.bind(apiClient),
  },
}

export default api
