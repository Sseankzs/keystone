"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Users, TrendingUp, Eye, MessageCircle, Plus, Upload, LinkIcon, FileText, Tag,
  CheckCircle, ArrowRight, X, Loader2, Target, DollarSign, Calendar,
  Search, Filter, Download, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Minus, Loader,
  CircleCheck, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const ACTIVE_GRANTS = [
  {
    grant_id: "1",
    title: "Tech Innovation Grant 2024",
    issuer: "Innovation Foundation",
    country: "United States",
    status: "open",
    deadline: "2024-03-15",
    amount_min: 500000,
    amount_max: 2500000,
    sector_tags: ["Technology", "AI/ML", "Innovation", "SMEs"],
    applications: 45,
    allocated: 750000,
  },
  {
    grant_id: "2",
    title: "Green Energy Initiative",
    issuer: "Clean Energy Fund",
    country: "United States",
    status: "open",
    deadline: "2024-04-30",
    amount_min: 100000,
    amount_max: 1000000,
    sector_tags: ["Clean Energy", "Sustainability", "Environment", "Green Tech"],
    applications: 23,
    allocated: 200000,
  },
  {
    grant_id: "3",
    title: "Healthcare Innovation Fund",
    issuer: "HealthTech Ventures",
    country: "United States",
    status: "upcoming",
    deadline: "2024-06-01",
    amount_min: 200000,
    amount_max: 3000000,
    sector_tags: ["Healthcare", "MedTech", "Innovation", "Biotech"],
    applications: 0,
    allocated: 0,
  },
]

// Comprehensive mock data for SME profiles
const ALL_SME_PROFILES = [
  {
    company_id: "1",
    name: "AI Solutions Inc",
    sector: "Technology",
    state: "California",
    headcount: 35,
    years_op: 3,
    revenue_myr: 2.5,
    certs: ["ISO 27001", "SOC 2", "AWS Certified"],
    profile_last_updated: "2024-02-20T10:30:00Z",
    grant_id: "1",
    application_status: "Under Review",
    application_date: "2024-02-15",
    score: 85,
    priority: "High",
    reviewer: "John Smith",
    last_activity: "2024-02-20",
    documents: 8,
    chat_messages: 12,
  },
  {
    company_id: "2",
    name: "GreenTech Startup",
    sector: "Clean Energy",
    state: "Texas",
    headcount: 18,
    years_op: 2,
    revenue_myr: 1.2,
    certs: ["ISO 14001", "LEED Certified"],
    profile_last_updated: "2024-02-18T14:20:00Z",
    grant_id: "2",
    application_status: "Approved",
    application_date: "2024-02-10",
    score: 92,
    priority: "Medium",
    reviewer: "Sarah Johnson",
    last_activity: "2024-02-18",
    documents: 6,
    chat_messages: 8,
  },
  {
    company_id: "3",
    name: "MedDevice Co",
    sector: "Healthcare",
    state: "Massachusetts",
    headcount: 75,
    years_op: 8,
    revenue_myr: 15.8,
    certs: ["FDA Approved", "ISO 13485", "CE Mark"],
    profile_last_updated: "2024-02-12T09:15:00Z",
    grant_id: "1",
    application_status: "Rejected",
    application_date: "2024-02-08",
    score: 65,
    priority: "Low",
    reviewer: "Mike Chen",
    last_activity: "2024-02-12",
    documents: 10,
    chat_messages: 5,
  },
  {
    company_id: "4",
    name: "DataFlow Analytics",
    sector: "Technology",
    state: "Washington",
    headcount: 8,
    years_op: 1,
    revenue_myr: 0.8,
    certs: ["AWS Certified", "Google Cloud"],
    profile_last_updated: "2024-02-21T16:45:00Z",
    grant_id: "1",
    application_status: "Under Review",
    application_date: "2024-02-18",
    score: 78,
    priority: "High",
    reviewer: "John Smith",
    last_activity: "2024-02-21",
    documents: 7,
    chat_messages: 15,
  },
  {
    company_id: "5",
    name: "EcoMaterials Corp",
    sector: "Clean Energy",
    state: "Colorado",
    headcount: 3,
    years_op: 1,
    revenue_myr: 0.3,
    certs: ["ISO 9001"],
    profile_last_updated: "2024-02-19T11:30:00Z",
    grant_id: "2",
    application_status: "Pending Review",
    application_date: "2024-02-19",
    score: 0,
    priority: "Medium",
    reviewer: null,
    last_activity: "2024-02-19",
    documents: 5,
    chat_messages: 0,
  },
  {
    company_id: "6",
    name: "HealthTech Innovations",
    sector: "Healthcare",
    state: "New York",
    headcount: 42,
    years_op: 4,
    revenue_myr: 8.2,
    certs: ["HIPAA Compliant", "ISO 27001", "FDA Approved"],
    profile_last_updated: "2024-02-20T13:20:00Z",
    grant_id: "3",
    application_status: "Under Review",
    application_date: "2024-02-12",
    score: 88,
    priority: "High",
    reviewer: "Sarah Johnson",
    last_activity: "2024-02-20",
    documents: 12,
    chat_messages: 20,
  },
  {
    company_id: "7",
    name: "AgriTech Solutions",
    sector: "Agriculture",
    state: "Illinois",
    headcount: 15,
    years_op: 3,
    revenue_myr: 1.8,
    certs: ["Organic Certified", "USDA Approved"],
    profile_last_updated: "2024-02-15T08:45:00Z",
    grant_id: "2",
    application_status: "Approved",
    application_date: "2024-02-05",
    score: 90,
    priority: "Medium",
    reviewer: "Mike Chen",
    last_activity: "2024-02-15",
    documents: 6,
    chat_messages: 10,
  },
  {
    company_id: "8",
    name: "FinTech Pro",
    sector: "Financial Services",
    state: "Florida",
    headcount: 85,
    years_op: 6,
    revenue_myr: 12.5,
    certs: ["PCI DSS", "SOC 2", "ISO 27001"],
    profile_last_updated: "2024-02-10T15:30:00Z",
    grant_id: "1",
    application_status: "Rejected",
    application_date: "2024-02-03",
    score: 58,
    priority: "Low",
    reviewer: "John Smith",
    last_activity: "2024-02-10",
    documents: 9,
    chat_messages: 3,
  },
]

const RECENT_SME_PROFILES = ALL_SME_PROFILES.slice(0, 3)

const STATS = {
  totalGrants: 8,
  activeGrants: 2,
  totalApplications: 156,
  approvalRate: 35,
  totalFunded: "$2.1M",
  avgProcessingTime: "12 days",
}

export default function FunderDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [smeProfiles, setSmeProfiles] = useState(ALL_SME_PROFILES)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [grantFilter, setGrantFilter] = useState("all")
  const [sortBy, setSortBy] = useState("submittedDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Upload functionality
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isProcessed, setIsProcessed] = useState(false)

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, grantFilter, categoryFilter])

  // Scroll to top when processing completes
  React.useEffect(() => {
    if (isProcessed) {
      // Scroll to top of page to show the Grant Details and Tags section
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [isProcessed])
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    url: "",
    file: null as File | null,
    title: "",
    issuer: "",
    country: "",
    status: "open",
    amount_min: "",
    amount_max: "",
    deadline: "",
    sector_tags: [] as string[],
    eligibility_rules: [] as Array<{key: string, value: string}>,
    required_documents: [] as string[],
  })

  // Auto-generated content
  const MOCK_TAGS = ["Technology", "AI/ML", "Startups", "Innovation", "Series A", "B2B", "SaaS", "Growth Stage"]
  const MOCK_CHECKLIST = [
    { item: "Business plan required", required: true },
    { item: "Financial projections (3 years)", required: true },
    { item: "Technical documentation", required: true },
    { item: "Team CVs and backgrounds", required: true },
    { item: "Market analysis", required: false },
    { item: "Customer testimonials", required: false },
  ]

  // Upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setUploadedFiles((prev) => [...prev, ...files])
      if (files[0]) {
        setFormData((prev) => ({ ...prev, file: files[0] }))
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))
    if (file) {
      setUploadedFiles((prev) => [...prev, file])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // TODO: Upload file/URL to backend for processing
    console.log("Processing grant:", formData)

    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false)
      setIsProcessed(true)
      // Populate form with mock data
      setFormData(prev => ({
        ...prev,
        title: "Tech Innovation Grant 2024",
        issuer: "Innovation Foundation",
        country: "Malaysia",
        status: "open",
        amount_min: "500000",
        amount_max: "2500000",
        deadline: "2024-12-31"
      }))
    }, 3000)
  }

  const handleSaveGrant = () => {
    // TODO: Save processed grant to database
    console.log("Saving grant with tags and checklist")
    // Reset form and go back to overview
    setIsProcessed(false)
    setFormData({ 
      url: "", 
      file: null,
      title: "",
      issuer: "",
      country: "",
      status: "open",
      amount_min: "",
      amount_max: "",
      deadline: "",
      sector_tags: [],
      eligibility_rules: [],
      required_documents: [],
    })
    setUploadedFiles([])
    setActiveTab("overview")
  }

  // Filter and sort SME profiles
  const filteredSmeProfiles = smeProfiles
    .filter((profile) => {
      const grant = ACTIVE_GRANTS.find(g => g.grant_id === profile.grant_id)
      const grantTitle = grant?.title || `Grant ${profile.grant_id}`
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           grantTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           profile.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           profile.state.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || profile.application_status === statusFilter
      const matchesGrant = grantFilter === "all" || grantTitle === grantFilter
      const matchesCategory = categoryFilter === "all" || profile.sector.toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesStatus && matchesGrant && matchesCategory
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a]
      let bValue = b[sortBy as keyof typeof b]
      
      if (sortBy === "application_date" || sortBy === "last_activity" || sortBy === "profile_last_updated") {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else if (sortBy === "revenue_myr" || sortBy === "headcount" || sortBy === "years_op") {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }
      
      if (sortOrder === "asc") {
        return (aValue as any) < (bValue as any) ? -1 : (aValue as any) > (bValue as any) ? 1 : 0
      } else {
        return (aValue as any) > (bValue as any) ? -1 : (aValue as any) < (bValue as any) ? 1 : 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredSmeProfiles.length / itemsPerPage)
  const paginatedSmeProfiles = filteredSmeProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Get unique grants for filter
  const uniqueGrants = Array.from(new Set(smeProfiles.map(profile => {
    const grant = ACTIVE_GRANTS.find(g => g.grant_id === profile.grant_id)
    return grant?.title || `Grant ${profile.grant_id}`
  })))

  // Handle selection
  const handleSelectSmeProfile = (id: string) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(profileId => profileId !== id)
        : [...prev, id]
    )
  }

  // Handle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === paginatedSmeProfiles.length
        ? []
        : paginatedSmeProfiles.map(profile => profile.company_id)
    )
  }

  // Bulk actions
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on applications:`, selectedApplications)
    // TODO: Implement bulk actions
  }

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  // Get sort icon for column
  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="h-4 w-4 text-foreground" />
      : <ArrowDown className="h-4 w-4 text-foreground" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Pending Review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'Technology':
        return 'bg-blue-100 text-blue-800'
      case 'Clean Energy':
        return 'bg-green-100 text-green-800'
      case 'Healthcare':
        return 'bg-red-100 text-red-800'
      case 'Agriculture':
        return 'bg-yellow-100 text-yellow-800'
      case 'Financial Services':
        return 'bg-purple-100 text-purple-800'
      case 'Manufacturing':
        return 'bg-blue-100 text-blue-800'
      case 'Education':
        return 'bg-indigo-100 text-indigo-800'
      case 'Retail':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Innovation Foundation!</h1>
          <p className="text-gray-600 text-lg">Manage your grants and review applications from promising startups.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{STATS.totalGrants}</div>
            <div className="text-sm text-gray-600">Total Grants</div>
          </div>

          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{STATS.activeGrants}</div>
            <div className="text-sm text-gray-600">Active Grants</div>
          </div>

          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{STATS.totalApplications}</div>
            <div className="text-sm text-gray-600">Applications</div>
          </div>

          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{STATS.approvalRate}%</div>
            <div className="text-sm text-gray-600">Approval Rate</div>
          </div>

          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{STATS.totalFunded}</div>
            <div className="text-sm text-gray-600">Total Funded</div>
          </div>

          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{STATS.avgProcessingTime}</div>
            <div className="text-sm text-gray-600">Avg Processing</div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="px-6 py-2.5 rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="applications" className="px-6 py-2.5 rounded-lg">Applications</TabsTrigger>
            <TabsTrigger value="upload" className="px-6 py-2.5 rounded-lg">Create Grant</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Active Grants */}
            <Card>
              <CardHeader>
                <CardTitle>Active Grants</CardTitle>
                <CardDescription>Your currently open funding opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ACTIVE_GRANTS.filter((grant) => grant.status === "open").map((grant) => {
                    const allocationPercentage = grant.amount_max > 0 ? (grant.allocated / grant.amount_max) * 100 : 0

                    return (
                      <div key={grant.grant_id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{grant.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{grant.country}</span>
                              <span className="text-xs text-gray-500">{grant.issuer}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {grant.sector_tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(grant.status === 'open' ? 'Active' : grant.status === 'closed' ? 'Closed' : 'Draft')} whitespace-nowrap`}>
                              {grant.status === 'open' ? 'Open' : grant.status === 'closed' ? 'Closed' : 'Upcoming'}
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-1">{grant.applications} applications</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Funding Range</div>
                            <div className="font-semibold">${grant.amount_min.toLocaleString()} - ${grant.amount_max.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Allocated</div>
                            <div className="font-semibold">${grant.allocated.toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Budget Allocation</span>
                            <span className="text-sm text-muted-foreground">{Math.round(allocationPercentage)}%</span>
                          </div>
                          <Progress value={allocationPercentage} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <strong>Deadline:</strong> {new Date(grant.deadline).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/funder/grant/${grant.grant_id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            <Button size="sm">
                              <Users className="mr-2 h-4 w-4" />
                              Applications
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent SME Profiles */}
            <Card>
              <CardHeader>
                <CardTitle>Recent SME Profiles</CardTitle>
                <CardDescription>Latest SME profiles requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_SME_PROFILES.slice(0, 3).map((profile) => {
                    const grant = ACTIVE_GRANTS.find(g => g.grant_id === profile.grant_id)
                    return (
                      <div key={profile.company_id} className="flex items-center justify-between border border-border rounded-lg p-4">
                        <div>
                          <h3 className="font-semibold">{profile.name}</h3>
                          <p className="text-sm text-muted-foreground">{grant?.title || `Grant ${profile.grant_id}`}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSectorColor(profile.sector)}`}>
                              {profile.sector}
                            </span>
                            <span>{profile.state}</span>
                            <span>{profile.headcount} employees</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(profile.application_status)} whitespace-nowrap`}>{profile.application_status}</Badge>
                          <div className="text-sm text-muted-foreground mt-1">Score: {profile.score}%</div>
                          <div className="text-sm text-muted-foreground">{profile.application_date}</div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Review
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grants">
            <Card>
              <CardHeader>
                <CardTitle>All Grants</CardTitle>
                <CardDescription>Manage all your funding opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Grant Management</h3>
                  <p className="text-muted-foreground mb-4">Create, edit, and manage your funding opportunities.</p>
                  <Link href="/funder/upload">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Grant
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            {/* Upload Form */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Create New Grant
                </CardTitle>
                <CardDescription>
                  Upload your grant document or provide a URL. Our AI will extract key information and create matching criteria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Upload Method Selection */}
                  <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "url")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file">Upload File</TabsTrigger>
                      <TabsTrigger value="url">Provide URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="file">Grant Document (PDF) *</Label>
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                            dragActive
                              ? "border-blue-400 bg-blue-50/50"
                              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
                          )}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center space-y-4">
                            <div className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                              dragActive ? "bg-blue-100" : "bg-gray-100"
                            )}>
                              <Upload className={cn(
                                "h-8 w-8 transition-colors",
                                dragActive ? "text-blue-600" : "text-gray-500"
                              )} />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload grant documents</h3>
                              <p className="text-gray-600">
                                Drag and drop files here or{" "}
                                <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                                  choose files to upload
                                  <input
                                    id="file"
                                    type="file"
                                    accept=".pdf,.txt,.md"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    required={uploadMethod === "file"}
                                  />
                                </label>
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">Supported: PDF, DOC, XLSX, PNG, JPG (Max 10MB each)</p>
                          </div>
                        </div>

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Uploaded Files</h4>
                            <div className="space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="url">Grant Document URL *</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com/grant-document.pdf"
                            value={formData.url}
                            onChange={(e) => handleInputChange("url", e.target.value)}
                            className="pl-10 border-gray-200 focus:border-blue-500"
                            required={uploadMethod === "url"}
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          Provide a direct link to your grant document (PDF format preferred)
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <h3 className="font-semibold text-gray-900 mb-2">Processing Grant Document</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Our AI is analyzing your document to extract key information, generate tags, and create application requirements.
                      </p>
                      <Progress value={66} className="max-w-xs mx-auto" />
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={
                      isProcessing ||
                      (uploadMethod === "file" && !formData.file) ||
                      (uploadMethod === "url" && !formData.url)
                    }
                  >
                    {isProcessing ? "Processing..." : "Process Grant Document"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Processed Results */}
            {isProcessed && (
              <div className="space-y-6 max-w-4xl mx-auto" data-processed-section>
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Grant Processing Complete!</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    We've successfully analyzed your grant document and auto-generated the following:
                  </p>
                </div>

                {/* Merged Grant Details and Tags */}
                <Card className="max-w-4xl mx-auto">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Grant Details and Tags
                    </CardTitle>
                    <CardDescription>Review and edit the extracted information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Details Form */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className="bg-gray-100 border-0 rounded-lg shadow-none" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issuer">Issuer *</Label>
                        <Input id="issuer" value={formData.issuer} onChange={(e) => handleInputChange("issuer", e.target.value)} className="bg-gray-100 border-0 rounded-lg shadow-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Input id="country" value={formData.country} onChange={(e) => handleInputChange("country", e.target.value)} className="bg-gray-100 border-0 rounded-lg shadow-none" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                            <SelectTrigger id="status" className="bg-gray-100 border-0 rounded-lg shadow-none">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount_min">Min Amount (RM) *</Label>
                          <Input id="amount_min" type="number" value={formData.amount_min} onChange={(e) => handleInputChange("amount_min", e.target.value)} className="bg-gray-100 border-0 rounded-lg shadow-none" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount_max">Max Amount (RM) *</Label>
                          <Input id="amount_max" type="number" value={formData.amount_max} onChange={(e) => handleInputChange("amount_max", e.target.value)} className="bg-gray-100 border-0 rounded-lg shadow-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deadline">Deadline *</Label>
                        <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => handleInputChange("deadline", e.target.value)} className="bg-gray-100 border-0 rounded-lg shadow-none" />
                      </div>
                      <div className="text-center">
                        <Button onClick={handleSaveGrant} className="bg-green-500 hover:bg-green-600 text-white rounded-xl">
                          Save Grant
                        </Button>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications">
            {/* Simplified Design - Just Filters and Table */}
            <div className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={categoryFilter === "all" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-50"}
                    onClick={() => setCategoryFilter("all")}
                  >
                    All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={categoryFilter === "technology" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-50"}
                    onClick={() => setCategoryFilter("technology")}
                  >
                    Technology
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={categoryFilter === "clean energy" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-50"}
                    onClick={() => setCategoryFilter("clean energy")}
                  >
                    Clean Energy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={categoryFilter === "healthcare" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-50"}
                    onClick={() => setCategoryFilter("healthcare")}
                  >
                    Healthcare
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={categoryFilter === "financial services" ? "bg-blue-50 text-blue-700 border-blue-200" : "text-gray-600 hover:bg-gray-50"}
                    onClick={() => setCategoryFilter("financial services")}
                  >
                    Financial
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // Add new SME profile logic
                    const newProfile = {
                      company_id: String(ALL_SME_PROFILES.length + 1),
                      name: `New Company ${ALL_SME_PROFILES.length + 1}`,
                      sector: "Technology",
                      state: "California",
                      headcount: 5,
                      years_op: 1,
                      revenue_myr: 0.5,
                      certs: ["ISO 9001"],
                      profile_last_updated: new Date().toISOString(),
                      grant_id: "1",
                      application_status: "Pending Review",
                      application_date: new Date().toISOString().split('T')[0],
                      score: 0,
                      priority: "Medium",
                      reviewer: null,
                      last_activity: new Date().toISOString().split('T')[0],
                      documents: 3,
                      chat_messages: 0,
                    }
                    setSmeProfiles(prev => [...prev, newProfile])
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>

              {/* Table Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending Review">Pending Review</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={grantFilter} onValueChange={setGrantFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Grants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grants</SelectItem>
                      {uniqueGrants.map((grant) => (
                        <SelectItem key={grant} value={grant}>{grant}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </div>

              {/* SME Profiles Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">SME Profiles ({filteredSmeProfiles.length})</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-2">
                            Company
                            {getSortIcon("name")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("grant_id")}
                        >
                          <div className="flex items-center gap-2">
                            Grant
                            {getSortIcon("grant_id")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("revenue_myr")}
                        >
                          <div className="flex items-center gap-2">
                            Revenue (MYR)
                            {getSortIcon("revenue_myr")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("application_date")}
                        >
                          <div className="flex items-center gap-2">
                            Applied on
                            {getSortIcon("application_date")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("sector")}
                        >
                          <div className="flex items-center gap-2">
                            Sector & State
                            {getSortIcon("sector")}
                          </div>
                        </th>
                      </tr>
                    </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* SME profile rows using actual mock data */}
                          {paginatedSmeProfiles.map((profile, index) => {
                            const isExpanded = expandedRows.has(profile.company_id)
                            const grant = ACTIVE_GRANTS.find(g => g.grant_id === profile.grant_id)
                            return (
                              <>
                                <tr key={profile.company_id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap w-16">
                                    <button
                                      onClick={() => toggleRowExpansion(profile.company_id)}
                                      className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                      {isExpanded ? (
                                        <Minus className="w-3 h-3 text-gray-600" />
                                      ) : (
                                        <Plus className="w-3 h-3 text-gray-600" />
                                      )}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                                    <div className="text-xs text-gray-500">{profile.headcount} employees • {profile.years_op} years</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="text-blue-500 font-medium">GRANT-{profile.grant_id}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{grant?.title || `Grant ${profile.grant_id}`}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="font-medium">MYR {profile.revenue_myr.toFixed(1)}M</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {new Date(profile.application_date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSectorColor(profile.sector)}`}>
                                        {profile.sector}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {profile.state}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-6">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Company Profile</h4>
                                            <div className="space-y-2 text-sm">
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">State:</span>
                                                <span className="text-gray-900">{profile.state}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Headcount:</span>
                                                <span className="text-gray-900">{profile.headcount} employees</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Years in Operation:</span>
                                                <span className="text-gray-900">{profile.years_op} years</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Revenue:</span>
                                                <span className="text-gray-900">MYR {profile.revenue_myr.toFixed(1)}M</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Last Updated:</span>
                                                <span className="text-gray-900">{new Date(profile.profile_last_updated).toLocaleDateString()}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Application Status</h4>
                                            <div className="space-y-2 text-sm">
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  profile.application_status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                  profile.application_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                  profile.application_status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                                  profile.application_status === 'Pending Review' ? 'bg-blue-100 text-blue-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {profile.application_status}
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Score:</span>
                                                <span className="text-gray-900">{profile.score > 0 ? `${profile.score}%` : 'Not scored'}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Priority:</span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  profile.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                  profile.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-green-100 text-green-800'
                                                }`}>
                                                  {profile.priority}
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Reviewer:</span>
                                                <span className="text-gray-900">{profile.reviewer || 'Unassigned'}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                          <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
                                            <div className="flex flex-wrap gap-1">
                                              {profile.certs.map((cert, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                  {cert}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                              <Eye className="w-4 h-4 mr-2" />
                                              View Profile
                                            </Button>
                                            <Button size="sm" variant="outline">
                                              <MessageCircle className="w-4 h-4 mr-2" />
                                              Open Chat
                                            </Button>
                                            <Button size="sm" variant="outline">
                                              <FileText className="w-4 h-4 mr-2" />
                                              View Documents
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            )
                          })}
                        </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
