"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, TrendingUp, Eye, MessageCircle, Plus, Settings, BarChart3, FileText } from "lucide-react"

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

const RECENT_APPLICATIONS = [
  {
    id: "1",
    companyName: "AI Solutions Inc",
    grantTitle: "Tech Innovation Grant 2024",
    amount: "$250,000",
    status: "Under Review",
    submittedDate: "Feb 15, 2024",
    score: 85,
  },
  {
    id: "2",
    companyName: "GreenTech Startup",
    grantTitle: "Green Energy Initiative",
    amount: "$150,000",
    status: "Approved",
    submittedDate: "Feb 10, 2024",
    score: 92,
  },
  {
    id: "3",
    companyName: "MedDevice Co",
    grantTitle: "Tech Innovation Grant 2024",
    amount: "$300,000",
    status: "Rejected",
    submittedDate: "Feb 8, 2024",
    score: 65,
  },
]

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
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
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
                            <Badge className={getStatusColor(grant.status)}>{grant.status}</Badge>
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
                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
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
            <Card>
              <CardHeader>
                <CardTitle>Application Management</CardTitle>
                <CardDescription>Review and manage all applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Application management interface will be displayed here.</p>
              </CardContent>
            </Card>
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
