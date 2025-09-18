"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Building2, Users, TrendingUp, Eye, MessageCircle, Plus, Settings, BarChart3, FileText,
  Search, Filter, Download, MoreHorizontal, Calendar, DollarSign, Star, Clock, CheckCircle, XCircle,
  ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react"

// Mock data
const ACTIVE_GRANTS = [
  {
    id: "1",
    title: "Tech Innovation Grant 2024",
    status: "Active",
    applications: 45,
    budget: "$2,500,000",
    allocated: "$750,000",
    deadline: "March 15, 2024",
    tags: ["Technology", "AI/ML", "Innovation"],
  },
  {
    id: "2",
    title: "Green Energy Initiative",
    status: "Active",
    applications: 23,
    budget: "$1,000,000",
    allocated: "$200,000",
    deadline: "April 30, 2024",
    tags: ["Clean Energy", "Sustainability", "Environment"],
  },
  {
    id: "3",
    title: "Healthcare Innovation Fund",
    status: "Draft",
    applications: 0,
    budget: "$3,000,000",
    allocated: "$0",
    deadline: "June 1, 2024",
    tags: ["Healthcare", "MedTech", "Innovation"],
  },
]

// Comprehensive mock data for applications
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

  // Filter and sort applications
  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.grantTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.sector.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      const matchesGrant = grantFilter === "all" || app.grantTitle === grantFilter
      return matchesSearch && matchesStatus && matchesGrant
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
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
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
        return "bg-green-100 text-green-800 border-green-200"
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Closed":
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">FundConnect</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/funder/grants" className="text-muted-foreground hover:text-foreground transition-colors">
                My Grants
              </Link>
              <Link
                href="/funder/applications"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Applications
              </Link>
              <Link href="/funder/analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Link href="/funder/upload">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Grant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Innovation Foundation!</h1>
          <p className="text-muted-foreground">Manage your grants and review applications from promising startups.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Grants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{STATS.totalGrants}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mr-1" />
                All time
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Grants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{STATS.activeGrants}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Currently open
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{STATS.totalApplications}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                Total received
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{STATS.approvalRate}%</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4 mr-1" />
                Last 6 months
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Funded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{STATS.totalFunded}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                This year
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{STATS.avgProcessingTime}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Review time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="grants">My Grants</TabsTrigger>
            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                  {ACTIVE_GRANTS.filter((grant) => grant.status === "Active").map((grant) => {
                    const allocationPercentage =
                      (Number.parseInt(grant.allocated.replace(/[$,]/g, "")) /
                        Number.parseInt(grant.budget.replace(/[$,]/g, ""))) *
                      100

                    return (
                      <div key={grant.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{grant.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {grant.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(grant.status)} whitespace-nowrap`}>{grant.status}</Badge>
                            <div className="text-sm text-muted-foreground mt-1">{grant.applications} applications</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Total Budget</div>
                            <div className="font-semibold">{grant.budget}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Allocated</div>
                            <div className="font-semibold">{grant.allocated}</div>
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
                            <strong>Deadline:</strong> {grant.deadline}
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
                    )
                  })}
                </div>
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

          <TabsContent value="applications">
            <div className="space-y-6">
              {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Application Management</CardTitle>
                  <CardDescription>Review and manage all applications ({filteredApplications.length} total)</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by company, grant, or sector..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
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
                          <SelectValue placeholder="Grant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grants</SelectItem>
                          {uniqueGrants.map((grant) => (
                            <SelectItem key={grant} value={grant}>{grant}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedApplications.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{selectedApplications.length} selected</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction("approve")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction("reject")}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkAction("export")}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Applications List */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr className="text-left">
                          <th className="p-4">
                            <Checkbox
                              checked={selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </th>
                          <th 
                            className="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                            onClick={() => handleSort("companyName")}
                          >
                            <div className="flex items-center gap-2">
                              Company
                              {getSortIcon("companyName")}
                            </div>
                          </th>
                          <th 
                            className="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                            onClick={() => handleSort("grantTitle")}
                          >
                            <div className="flex items-center gap-2">
                              Grant
                              {getSortIcon("grantTitle")}
                            </div>
                          </th>
                          <th 
                            className="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                            onClick={() => handleSort("amount")}
                          >
                            <div className="flex items-center gap-2">
                              Amount
                              {getSortIcon("amount")}
                            </div>
                          </th>
                          <th 
                            className="p-4 font-medium select-none"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center gap-2">
                              Status
                              {getSortIcon("status")}
                            </div>
                          </th>
                          <th 
                            className="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                            onClick={() => handleSort("score")}
                          >
                            <div className="flex items-center gap-2">
                              Score
                              {getSortIcon("score")}
                            </div>
                          </th>
                          <th 
                            className="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                            onClick={() => handleSort("priority")}
                          >
                            <div className="flex items-center gap-2">
                              Priority
                              {getSortIcon("priority")}
                            </div>
                          </th>
                          <th 
                            className="p-4 font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                            onClick={() => handleSort("submittedDate")}
                          >
                            <div className="flex items-center gap-2">
                              Submitted
                              {getSortIcon("submittedDate")}
                            </div>
                          </th>
                          <th className="p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedApplications.map((app) => (
                          <tr key={app.id} className="border-b border-border hover:bg-muted/50">
                            <td className="p-4">
                              <Checkbox
                                checked={selectedApplications.includes(app.id)}
                                onCheckedChange={() => handleSelectApplication(app.id)}
                              />
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{app.companyName}</div>
                                <div className="text-sm text-muted-foreground">{app.sector} • {app.stage}</div>
                                <div className="text-sm text-muted-foreground">{app.location}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">{app.grantTitle}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-foreground">{app.amount}</div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${getStatusColor(app.status)} whitespace-nowrap`}>{app.status}</Badge>
                            </td>
                            <td className="p-4">
                              {app.score > 0 ? (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="font-medium">{app.score}%</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className={getPriorityColor(app.priority)}>
                                {app.priority}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">{new Date(app.submittedDate).toLocaleDateString()}</div>
                              {app.reviewer && (
                                <div className="text-xs text-muted-foreground">by {app.reviewer}</div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            )
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Track performance and funding trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">Detailed analytics and insights about your funding programs.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
