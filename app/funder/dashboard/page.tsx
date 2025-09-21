"use client"

import React, { useState, useEffect } from "react"
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
  Building2, Users, TrendingUp, Eye, MessageCircle, Plus, Settings, Upload, LinkIcon, FileText, Tag,
  CheckCircle, ArrowRight, X, Loader2, Target, DollarSign, Calendar,
  Search, Filter, Download, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Minus, Loader,
  CircleCheck, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types for real grant data
interface Grant {
  grant_id: string
  title: string
  issuer: string
  status: string
  sector_tags: string[]
  eligibility_rules: Array<{key: string, value: string}>
  required_documents: string[]
  country?: string
  deadline?: string
  amount_min?: number
  amount_max?: number
  created_at: string
  updated_at: string
  document_s3_key?: string
  source_url?: string
}

// Mock data for applications (keeping existing mock data for applications)
const ALL_APPLICATIONS = [
  {
    id: "1",
    companyName: "AI Solutions Inc",
    grantTitle: "Tech Innovation Grant 2024",
    amount: "$250,000",
    status: "Under Review",
    submittedDate: "2024-02-15",
    score: 85,
    sector: "Technology",
    stage: "Series A",
    location: "San Francisco, CA",
    employees: "25-50",
    priority: "High",
    reviewer: "John Smith",
    lastActivity: "2024-02-20",
    documents: 8,
    chatMessages: 12,
  },
  {
    id: "2",
    companyName: "GreenTech Startup",
    grantTitle: "Green Energy Initiative",
    amount: "$150,000",
    status: "Approved",
    submittedDate: "2024-02-10",
    score: 92,
    sector: "Clean Energy",
    stage: "Seed",
    location: "Austin, TX",
    employees: "10-25",
    priority: "Medium",
    reviewer: "Sarah Johnson",
    lastActivity: "2024-02-18",
    documents: 6,
    chatMessages: 8,
  },
  {
    id: "3",
    companyName: "MedDevice Co",
    grantTitle: "Tech Innovation Grant 2024",
    amount: "$300,000",
    status: "Rejected",
    submittedDate: "2024-02-08",
    score: 65,
    sector: "Healthcare",
    stage: "Series B",
    location: "Boston, MA",
    employees: "50-100",
    priority: "Low",
    reviewer: "Mike Chen",
    lastActivity: "2024-02-12",
    documents: 10,
    chatMessages: 5,
  },
  {
    id: "4",
    companyName: "DataFlow Analytics",
    grantTitle: "Tech Innovation Grant 2024",
    amount: "$180,000",
    status: "Under Review",
    submittedDate: "2024-02-18",
    score: 78,
    sector: "Technology",
    stage: "Seed",
    location: "Seattle, WA",
    employees: "5-10",
    priority: "High",
    reviewer: "John Smith",
    lastActivity: "2024-02-21",
    documents: 7,
    chatMessages: 15,
  },
  {
    id: "5",
    companyName: "EcoMaterials Corp",
    grantTitle: "Green Energy Initiative",
    amount: "$220,000",
    status: "Pending Review",
    submittedDate: "2024-02-19",
    score: 0,
    sector: "Clean Energy",
    stage: "Pre-seed",
    location: "Denver, CO",
    employees: "1-5",
    priority: "Medium",
    reviewer: null,
    lastActivity: "2024-02-19",
    documents: 5,
    chatMessages: 0,
  },
  {
    id: "6",
    companyName: "HealthTech Innovations",
    grantTitle: "Healthcare Innovation Fund",
    amount: "$400,000",
    status: "Under Review",
    submittedDate: "2024-02-12",
    score: 88,
    sector: "Healthcare",
    stage: "Series A",
    location: "New York, NY",
    employees: "25-50",
    priority: "High",
    reviewer: "Sarah Johnson",
    lastActivity: "2024-02-20",
    documents: 12,
    chatMessages: 20,
  },
  {
    id: "7",
    companyName: "AgriTech Solutions",
    grantTitle: "Green Energy Initiative",
    amount: "$120,000",
    status: "Approved",
    submittedDate: "2024-02-05",
    score: 90,
    sector: "Agriculture",
    stage: "Seed",
    location: "Chicago, IL",
    employees: "10-25",
    priority: "Medium",
    reviewer: "Mike Chen",
    lastActivity: "2024-02-15",
    documents: 6,
    chatMessages: 10,
  },
  {
    id: "8",
    companyName: "FinTech Pro",
    grantTitle: "Tech Innovation Grant 2024",
    amount: "$350,000",
    status: "Rejected",
    submittedDate: "2024-02-03",
    score: 58,
    sector: "Financial Services",
    stage: "Series B",
    location: "Miami, FL",
    employees: "50-100",
    priority: "Low",
    reviewer: "John Smith",
    lastActivity: "2024-02-10",
    documents: 9,
    chatMessages: 3,
  },
]

const RECENT_APPLICATIONS = ALL_APPLICATIONS.slice(0, 3)

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
  const [applications, setApplications] = useState(ALL_APPLICATIONS)
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

  // Real grants data
  const [grants, setGrants] = useState<Grant[]>([])
  const [grantsLoading, setGrantsLoading] = useState(true)
  const [grantsError, setGrantsError] = useState<string | null>(null)

  // Current issuer - you can make this dynamic later
  const currentIssuer = "innovation-foundation-001"

  // Fetch real grants on component mount
  useEffect(() => {
    fetchGrants()
  }, [])

  const fetchGrants = async () => {
    try {
      setGrantsLoading(true)
      setGrantsError(null)
      
      // Replace with your actual API endpoint URL
      const response = await fetch(`https://ttijzyc5n5.execute-api.ap-southeast-1.amazonaws.com/dev/grants?issuer=${currentIssuer}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch grants: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      setGrants(data.grants || [])
      
      // Update stats based on real data
      STATS.totalGrants = data.grants?.length || 0
      STATS.activeGrants = data.grants?.filter((g: Grant) => g.status === 'open')?.length || 0
      
    } catch (error) {
      console.error('Error fetching grants:', error)
      setGrantsError(error instanceof Error ? error.message : 'Failed to fetch grants')
    } finally {
      setGrantsLoading(false)
    }
  }

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, grantFilter, categoryFilter])

  // Upload functionality
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isProcessed, setIsProcessed] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    url: "",
    file: null as File | null,
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

    try {
      console.log("Processing grant:", formData)

      // Prepare the API request payload
      let requestPayload: any = {
        issuer: "innovation-foundation-001", // Default funder ID - could be made dynamic later
      }

      let apiEndpoint = ""

      if (uploadMethod === "file" && formData.file) {
        // Convert file to base64 for PDF upload endpoint
        const base64Content = await convertFileToBase64(formData.file)
        requestPayload.pdf_content = base64Content
        apiEndpoint = "https://b4lzhuuhk1.execute-api.ap-southeast-1.amazonaws.com/dev/upload-grant"
        console.log("File converted to base64, size:", base64Content.length)
      } else if (uploadMethod === "url" && formData.url) {
        // Use URL for website scraping endpoint
        requestPayload.url = formData.url
        apiEndpoint = "https://bbivvo6xm4.execute-api.ap-southeast-1.amazonaws.com/dev/upload-grant-url"
        console.log("Using URL scraping for:", formData.url)
      } else {
        console.error("No valid input method selected")
        setIsProcessing(false)
        return
      }

      console.log("Sending request to AWS API:", {
        endpoint: apiEndpoint,
        method: uploadMethod,
        payload: uploadMethod === "file" 
          ? {
              ...requestPayload,
              pdf_content: `${requestPayload.pdf_content?.substring(0, 100)}... (${requestPayload.pdf_content?.length} chars total)`
            }
          : requestPayload
      })

      // Make POST request to appropriate AWS Lambda endpoint
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload)
      })

      const result = await response.json()
      
      if (response.ok) {
        
        // Show success message to user
        const sourceType = uploadMethod === "file" ? "PDF document" : "website"
        alert(`Grant "${result.grant_data?.title}" has been successfully created from ${sourceType} and saved!\n\nGrant ID: ${result.grant_id}`)
        
        // Auto-save is complete, reset form and return to overview
        setFormData({ url: "", file: null })
        setUploadedFiles([])
        setActiveTab("overview")
        
        // Refresh grants list
        fetchGrants()
        
        // Optionally show the processed results briefly before returning to overview
        // setIsProcessed(true)
      } else {
        console.error("❌ API Error:", result)
        alert(`Error: ${result.error || 'Unknown error occurred'}`)
      }

    } catch (error) {
      console.error("❌ Network/Processing Error:", error)
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Error reading file'))
      reader.readAsDataURL(file)
    })
  }

  const handleSaveGrant = () => {
    // TODO: Save processed grant to database
    console.log("Saving grant with tags and checklist")
    // Reset form and go back to overview
    setIsProcessed(false)
    setFormData({ url: "", file: null })
    setUploadedFiles([])
    setActiveTab("overview")
  }

  // Helper function to format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not specified"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified"
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Filter and sort applications
  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.grantTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.sector.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      const matchesGrant = grantFilter === "all" || app.grantTitle === grantFilter
      const matchesCategory = categoryFilter === "all" || app.sector.toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesStatus && matchesGrant && matchesCategory
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a]
      let bValue = b[sortBy as keyof typeof b]
      
      if (sortBy === "submittedDate" || sortBy === "lastActivity") {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else if (sortBy === "amount") {
        aValue = Number.parseInt((aValue as string).replace(/[$,]/g, ""))
        bValue = Number.parseInt((bValue as string).replace(/[$,]/g, ""))
      }
      
      if (sortOrder === "asc") {
        return (aValue as any) < (bValue as any) ? -1 : (aValue as any) > (bValue as any) ? 1 : 0
      } else {
        return (aValue as any) > (bValue as any) ? -1 : (aValue as any) < (bValue as any) ? 1 : 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Get unique grants for filter
  const uniqueGrants = Array.from(new Set(applications.map(app => app.grantTitle)))

  // Handle selection
  const handleSelectApplication = (id: string) => {
    setSelectedApplications(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
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
      selectedApplications.length === paginatedApplications.length
        ? []
        : paginatedApplications.map(app => app.id)
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
      case "open":
        return "bg-green-100 text-green-800 border-green-200"
      case "Draft":
      case "upcoming":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Closed":
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Pending Review":
        return "bg-orange-100 text-orange-800 border-orange-200"
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Notion Style */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-gray-900" />
              <h1 className="text-2xl font-bold text-gray-900">Funder Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Innovation Foundation!</h1>
          <p className="text-gray-600 text-lg">Manage your grants and review applications from promising startups.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-sm text-gray-600 font-medium mb-2">Total Grants</div>
            <div className="text-2xl font-bold text-gray-900">{grantsLoading ? "..." : grants.length}</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-sm text-gray-600 font-medium mb-2">Active Grants</div>
            <div className="text-2xl font-bold text-gray-900">
              {grantsLoading ? "..." : grants.filter(g => g.status === 'open').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Currently open</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-sm text-gray-600 font-medium mb-2">Applications</div>
            <div className="text-2xl font-bold text-gray-900">{STATS.totalApplications}</div>
            <div className="text-xs text-gray-500 mt-1">Total received</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-sm text-gray-600 font-medium mb-2">Approval Rate</div>
            <div className="text-2xl font-bold text-gray-900">{STATS.approvalRate}%</div>
            <div className="text-xs text-gray-500 mt-1">Last 6 months</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-sm text-gray-600 font-medium mb-2">Total Funded</div>
            <div className="text-2xl font-bold text-gray-900">{STATS.totalFunded}</div>
            <div className="text-xs text-gray-500 mt-1">This year</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-sm text-gray-600 font-medium mb-2">Avg Processing</div>
            <div className="text-2xl font-bold text-gray-900">{STATS.avgProcessingTime}</div>
            <div className="text-xs text-gray-500 mt-1">Review time</div>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Grants</CardTitle>
                  <CardDescription>All grants created by your organization</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchGrants} disabled={grantsLoading}>
                  {grantsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </CardHeader>
              <CardContent>
                {grantsError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="font-medium">Error loading grants:</p>
                    <p className="text-sm">{grantsError}</p>
                    <p className="text-sm mt-2">
                      Make sure to update the API endpoint URL in the code with your actual AWS API Gateway URL.
                    </p>
                  </div>
                )}
                
                {grantsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">Loading grants...</span>
                  </div>
                ) : grants.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No grants found</h3>
                    <p className="text-gray-600 mb-4">
                      {grantsError ? "Unable to load grants." : "You haven't created any grants yet."}
                    </p>
                    <Button onClick={() => setActiveTab("upload")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Grant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grants.map((grant) => (
                      <div key={grant.grant_id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{grant.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {grant.sector_tags?.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(grant.status)} whitespace-nowrap`}>
                              {grant.status === 'open' ? 'Active' : grant.status}
                            </Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                              Created {formatDate(grant.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Min Amount</div>
                            <div className="font-semibold">{formatCurrency(grant.amount_min)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Max Amount</div>
                            <div className="font-semibold">{formatCurrency(grant.amount_max)}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <strong>Deadline:</strong> {formatDate(grant.deadline)}
                            {grant.country && <span className="ml-4"><strong>Country:</strong> {grant.country}</span>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button size="sm">
                              <Users className="mr-2 h-4 w-4" />
                              Applications
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest applications requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_APPLICATIONS.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between border border-border rounded-lg p-4">
                      <div>
                        <h3 className="font-semibold">{app.companyName}</h3>
                        <p className="text-sm text-muted-foreground">{app.grantTitle}</p>
                        <div className="text-lg font-bold text-primary mt-1">{app.amount}</div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(app.status)} whitespace-nowrap`}>{app.status}</Badge>
                        <div className="text-sm text-muted-foreground mt-1">Score: {app.score}%</div>
                        <div className="text-sm text-muted-foreground">{app.submittedDate}</div>
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
                  ))}
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
            <Card className="max-w-4xl">
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
              <div className="space-y-6 max-w-4xl">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Grant Processing Complete!</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    We've successfully analyzed your grant document and auto-generated the following:
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleSaveGrant} className="bg-green-600 hover:bg-green-700 text-white">
                      Save Grant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => setIsProcessed(false)}>
                      Make Changes
                    </Button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Tags Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-600" />
                        Auto-Generated Tags
                      </CardTitle>
                      <CardDescription>These tags help match your grant with relevant startups</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {MOCK_TAGS.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-blue-100 hover:text-blue-800"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm">
                        <Tag className="mr-2 h-4 w-4" />
                        Edit Tags
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Checklist Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        Application Checklist
                      </CardTitle>
                      <CardDescription>Requirements extracted from your grant document</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {MOCK_CHECKLIST.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{item.item}</span>
                            <Badge variant={item.required ? "default" : "secondary"}>
                              {item.required ? "Required" : "Optional"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="mt-4">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Edit Checklist
                      </Button>
                    </CardContent>
                  </Card>
                </div>
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
                    // Add new application logic
                    const newApp = {
                      id: String(ALL_APPLICATIONS.length + 1),
                      companyName: `New Company ${ALL_APPLICATIONS.length + 1}`,
                      grantTitle: "Tech Innovation Grant 2024",
                      amount: "$100,000",
                      status: "Pending Review",
                      submittedDate: new Date().toISOString().split('T')[0],
                      score: 0,
                      sector: "Technology",
                      stage: "Seed",
                      location: "San Francisco, CA",
                      employees: "1-10",
                      priority: "Medium",
                      reviewer: null,
                      lastActivity: new Date().toISOString().split('T')[0],
                      documents: 3,
                      chatMessages: 0,
                    }
                    setApplications(prev => [...prev, newApp])
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

              {/* Companies Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Company ({filteredApplications.length})</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("companyName")}
                        >
                          <div className="flex items-center gap-2">
                            Company
                            {getSortIcon("companyName")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("grantTitle")}
                        >
                          <div className="flex items-center gap-2">
                            Grant
                            {getSortIcon("grantTitle")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("amount")}
                        >
                          <div className="flex items-center gap-2">
                            Funding
                            {getSortIcon("amount")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("submittedDate")}
                        >
                          <div className="flex items-center gap-2">
                            Created on
                            {getSortIcon("submittedDate")}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                          onClick={() => handleSort("sector")}
                        >
                          <div className="flex items-center gap-2">
                            Categories
                            {getSortIcon("sector")}
                          </div>
                        </th>
                      </tr>
                    </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Sample company rows using actual mock data */}
                          {paginatedApplications.map((app, index) => {
                            const isExpanded = expandedRows.has(app.id)
                            return (
                              <>
                                <tr key={app.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap w-16">
                                    <button
                                      onClick={() => toggleRowExpansion(app.id)}
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
                                    <div className="text-sm font-medium text-gray-900">{app.companyName}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <span className="text-blue-500 font-medium">GRANT-{String(index + 1).padStart(2, '0')}</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {app.amount}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {new Date(app.submittedDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {app.sector}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {app.stage}
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
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Company Details</h4>
                                            <div className="space-y-2 text-sm">
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Location:</span>
                                                <span className="text-gray-900">{app.location}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Employees:</span>
                                                <span className="text-gray-900">{app.employees}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Priority:</span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  app.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                  app.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                  'bg-green-100 text-green-800'
                                                }`}>
                                                  {app.priority}
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Reviewer:</span>
                                                <span className="text-gray-900">{app.reviewer || 'Unassigned'}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Application Status</h4>
                                            <div className="space-y-2 text-sm">
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                  app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                  app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                  app.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                                  app.status === 'Pending Review' ? 'bg-orange-100 text-orange-800' :
                                                  'bg-gray-100 text-gray-800'
                                                }`}>
                                                  {app.status}
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Score:</span>
                                                <span className="text-gray-900">{app.score > 0 ? `${app.score}%` : 'Not scored'}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Documents:</span>
                                                <span className="text-gray-900">{app.documents} files</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span className="text-gray-500">Chat Messages:</span>
                                                <span className="text-gray-900">{app.chatMessages}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="pt-4 border-t border-gray-200">
                                          <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                              <Eye className="w-4 h-4 mr-2" />
                                              View Application
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