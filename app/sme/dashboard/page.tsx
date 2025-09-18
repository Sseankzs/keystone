"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Search, FileText, TrendingUp, CheckCircle, Clock, Plus, DollarSign, Target, BarChart3, ArrowUpRight, ArrowDownRight, Upload, X, File, Image, FileSpreadsheet, FileVideo, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const ACTIVE_APPLICATIONS = [
  {
    id: "1",
    title: "Tech Innovation Grant 2024",
    provider: "Department of Innovation",
    amount: "$250,000",
    status: "In Progress",
    deadline: "March 15, 2024",
    progress: 75,
    nextStep: "Submit technical documentation",
  },
  {
    id: "2",
    title: "Small Business Growth Fund",
    provider: "Regional Development Agency",
    amount: "$100,000",
    status: "Under Review",
    deadline: "April 30, 2024",
    progress: 100,
    nextStep: "Awaiting review decision",
  },
]

const RECENT_MATCHES = [
  {
    id: "3",
    title: "Digital Transformation Initiative",
    provider: "European Commission",
    amount: "$500,000",
    score: 65,
    status: "New",
  },
  {
    id: "4",
    title: "Green Tech Accelerator",
    provider: "Climate Fund",
    amount: "$150,000",
    score: 82,
    status: "New",
  },
]

// Mock document files
const MOCK_DOCUMENTS = [
  {
    id: "1",
    name: "Business Plan 2024.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadDate: "2024-01-15",
    category: "Business Plan",
    status: "Complete"
  },
  {
    id: "2",
    name: "Financial Projections.xlsx",
    type: "spreadsheet",
    size: "1.2 MB",
    uploadDate: "2024-01-12",
    category: "Financial",
    status: "Complete"
  },
  {
    id: "3",
    name: "Team CVs.pdf",
    type: "pdf",
    size: "3.1 MB",
    uploadDate: "2024-01-10",
    category: "Team",
    status: "Complete"
  },
  {
    id: "4",
    name: "Technical Documentation.pdf",
    type: "pdf",
    size: "4.8 MB",
    uploadDate: "2024-01-08",
    category: "Technical",
    status: "Complete"
  },
  {
    id: "5",
    name: "Market Analysis.pdf",
    type: "pdf",
    size: "1.9 MB",
    uploadDate: "2024-01-05",
    category: "Market Research",
    status: "Complete"
  },
  {
    id: "6",
    name: "Company Logo.png",
    type: "image",
    size: "245 KB",
    uploadDate: "2024-01-03",
    category: "Branding",
    status: "Complete"
  }
]

const STATS = {
  totalApplications: 5,
  activeApplications: 2,
  successRate: 40,
  totalFunding: "$350,000",
  monthlyGrowth: 12.5,
  avgProcessingTime: 14,
}

// Chart data for funding timeline
const FUNDING_TIMELINE = [
  { month: "Jan", amount: 0 },
  { month: "Feb", amount: 50000 },
  { month: "Mar", amount: 120000 },
  { month: "Apr", amount: 180000 },
  { month: "May", amount: 250000 },
  { month: "Jun", amount: 350000 },
  { month: "Jul", amount: 420000 },
  { month: "Aug", amount: 380000 },
  { month: "Sep", amount: 450000 },
  { month: "Oct", amount: 520000 },
  { month: "Nov", amount: 480000 },
  { month: "Dec", amount: 550000 },
]

// Animated counter hook
const useAnimatedCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    const startValue = 0
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(startValue + (end - startValue) * easeOutQuart)
      
      setCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration])
  
  return count
}

const TAB_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "applications", label: "Applications" },
  { value: "matches", label: "New Matches" },
  { value: "documents", label: "Documents" },
]

// Animated Chart Component
const AnimatedChart = ({ data }: { data: typeof FUNDING_TIMELINE }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  const maxAmount = Math.max(...data.map(d => d.amount))
  
  return (
    <div className="h-32 flex items-end space-x-2">
      {data.map((item, index) => {
        const height = (item.amount / maxAmount) * 100
        return (
          <div key={item.month} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-200 rounded-t-sm mb-2 relative overflow-hidden">
              <div
                className="bg-gradient-to-t from-blue-500 to-blue-400 w-full transition-all duration-1000 ease-out"
                style={{
                  height: isVisible ? `${height}%` : '0%',
                  transitionDelay: `${index * 100}ms`
                }}
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}

// File type icon component
const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    case "image":
      return <Image className="h-5 w-5 text-blue-500" />
    case "video":
      return <FileVideo className="h-5 w-5 text-purple-500" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
}

export default function SMEDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  
  // Animated counters
  const animatedTotalApps = useAnimatedCounter(STATS.totalApplications)
  const animatedActiveApps = useAnimatedCounter(STATS.activeApplications)
  const animatedSuccessRate = useAnimatedCounter(STATS.successRate)
  const animatedFunding = useAnimatedCounter(350000, 2500)

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = TAB_OPTIONS.findIndex(tab => tab.value === activeTab)
    const activeTabElement = tabRefs.current[activeIndex]
    
    if (activeTabElement) {
      const { offsetWidth, offsetLeft } = activeTabElement
      setIndicatorStyle({
        width: offsetWidth,
        left: offsetLeft,
      })
    }
  }, [activeTab])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back, Tech Startup Inc!</h1>
        <p className="text-sm text-gray-600">Here's an overview of your funding journey and recent activity.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600">Total Applications</div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2 this month
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{animatedTotalApps}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600">Active Applications</div>
            <div className="text-sm text-gray-500 font-medium">
              {STATS.avgProcessingTime} days avg
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{animatedActiveApps}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600">Success Rate</div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +5% vs last quarter
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{animatedSuccessRate}%</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-gray-600">Total Funding</div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{STATS.monthlyGrowth}% this month
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">${animatedFunding.toLocaleString()}</div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Custom Animated Tab List */}
        <div className="relative mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {TAB_OPTIONS.map((tab, index) => (
              <button
                key={tab.value}
                ref={(el) => { tabRefs.current[index] = el }}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "relative z-10 flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-300",
                  activeTab === tab.value
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Sliding Indicator */}
          <div
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out"
            style={{
              width: `${indicatorStyle.width}px`,
              left: `${indicatorStyle.left}px`,
            }}
          />
        </div>

        {/* Overview Content */}
        <TabsContent value="overview" className="space-y-6">
          {/* Funding Timeline Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Funding Timeline</h3>
                <p className="text-sm text-gray-600">Your funding progress over the last 12 months</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Total Funding</span>
              </div>
            </div>
            <AnimatedChart data={FUNDING_TIMELINE} />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Applications submitted this month</span>
                  <span className="text-sm font-semibold text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents uploaded</span>
                  <span className="text-sm font-semibold text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile completeness</span>
                  <span className="text-sm font-semibold text-gray-900">85%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tech Innovation Grant</span>
                  <span className="text-sm font-semibold text-red-600">3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Growth Fund</span>
                  <span className="text-sm font-semibold text-orange-600">12 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Digital Initiative</span>
                  <span className="text-sm font-semibold text-gray-600">28 days</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Applications</h3>
                <p className="text-sm text-gray-600">Track the progress of your current funding applications</p>
              </div>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New Application
              </Button>
            </div>
            <div className="space-y-4">
              {ACTIVE_APPLICATIONS.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{app.title}</h4>
                      <p className="text-sm text-gray-600">{app.provider}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{app.amount}</div>
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">{app.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${app.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Next:</span> {app.nextStep}
                    </div>
                    <div>
                      <span className="font-medium">Deadline:</span> {app.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Matches */}
        <TabsContent value="matches">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Matches</h3>
                <p className="text-sm text-gray-600">New funding opportunities that match your profile</p>
              </div>
              <Link href="/sme/goal-input">
                <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Search className="mr-1.5 h-3.5 w-3.5" />
                  Find More
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {RECENT_MATCHES.map((match) => (
                <div key={match.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                  <div>
                    <h4 className="font-semibold text-gray-900">{match.title}</h4>
                    <p className="text-sm text-gray-600">{match.provider}</p>
                    <div className="text-lg font-bold text-gray-900 mt-1">{match.amount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-2">Match Score</div>
                    <div className="text-lg font-semibold text-blue-600 mb-2">{match.score}%</div>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                  <p className="text-sm text-gray-600">Add new documents to your library</p>
                </div>
              </div>
              
              {/* Drag & Drop Area */}
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
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Upload documents</h4>
                    <p className="text-gray-600 mb-4">
                      Drag and drop files here or{" "}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                        choose files to upload
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">Supported: PDF, DOC, XLSX, PNG, JPG (Max 10MB each)</p>
                  </div>
                </div>
              </div>

              {/* Recently Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Recently Uploaded</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.type.split('/')[1] || 'file')}
                          <div>
                            <span className="text-sm font-medium text-gray-900">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
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

            {/* Document Library */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Document Library</h3>
                  <p className="text-sm text-gray-600">{MOCK_DOCUMENTS.length} documents organized by category</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Export All
                  </Button>
                </div>
              </div>

              {/* Document Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_DOCUMENTS.map((doc) => (
                  <div key={doc.id} className="group border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.size}</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                    
                    <div className="mt-2">
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {doc.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
