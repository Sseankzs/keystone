"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Building2,
  Calendar,
  DollarSign,
  CheckCircle,
  FileText,
  Upload,
  ArrowLeft,
  Target,
  Plus,
  X,
  ChevronRight,
  Circle
} from "lucide-react"

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
    grant_id: "MDEC-2024-001",
    title: "Malaysia Digital Economy Corporation (MDEC) Digital Innovation Fund",
    issuer: "Malaysia Digital Economy Corporation",
    country: "Malaysia",
    status: "open",
    deadline: "2025-03-15",
    amount_min: 500000,
    amount_max: 2500000,
    sector_tags: ["Digital Technology", "Innovation", "SMEs", "Startups", "AI/ML", "Fintech"],
    eligibility_rules: [
      { key: "Company Type", value: "Malaysian-registered SMEs or startups" },
      { key: "Technology Level", value: "Technology Readiness Level 5-8" },
      { key: "Innovation", value: "Strong digital innovation component" },
      { key: "Market", value: "Clear market potential in Malaysia" },
      { key: "Business Model", value: "Scalable digital business model" }
    ],
    required_documents: [
      "Technology Readiness Assessment",
      "Business Plan",
      "Financial Statements (2 years)",
      "Team CVs",
      "Innovation Documentation",
      "Market Research"
    ],
    description: "The MDEC Digital Innovation Fund supports Malaysian SMEs and startups with breakthrough digital innovations and high growth potential. This program provides grant funding to help companies scale their digital solutions and contribute to Malaysia's digital economy transformation."
  },
  "2": {
    grant_id: "MTDC-2024-002",
    title: "Malaysian Technology Development Corporation (MTDC) Technology Commercialisation Fund",
    issuer: "Malaysian Technology Development Corporation",
    country: "Malaysia",
    status: "open",
    deadline: "2025-04-20",
    amount_min: 200000,
    amount_max: 750000,
    sector_tags: ["Technology Commercialisation", "R&D", "Manufacturing", "Engineering", "Biotech"],
    eligibility_rules: [
      { key: "Company Type", value: "Malaysian-registered technology companies" },
      { key: "Technology Level", value: "Proven technology with commercial potential" },
      { key: "Innovation", value: "Novel technology or significant improvement" },
      { key: "Market", value: "Clear commercial market opportunity" },
      { key: "Business Model", value: "Viable commercialization strategy" }
    ],
    required_documents: [
      "Technology Commercialisation Plan",
      "Business Plan",
      "Financial Statements (2 years)",
      "Team CVs",
      "Technology Documentation",
      "Market Analysis"
    ],
    description: "The MTDC Technology Commercialisation Fund supports Malaysian companies in commercializing their research and development outcomes. This program provides funding to bridge the gap between R&D and market deployment, helping companies bring innovative technologies to market."
  },
  "3": {
    grant_id: "MGTC-2024-003",
    title: "Malaysian Green Technology Corporation (MGTC) Green Technology Fund",
    issuer: "Malaysian Green Technology Corporation",
    country: "Malaysia",
    status: "upcoming",
    deadline: "2025-05-10",
    amount_min: 300000,
    amount_max: 1200000,
    sector_tags: ["Green Technology", "Sustainability", "Renewable Energy", "Environmental", "Clean Tech"],
    eligibility_rules: [
      { key: "Company Type", value: "Malaysian-registered green technology companies" },
      { key: "Technology Level", value: "Environmentally friendly technology" },
      { key: "Innovation", value: "Green innovation with environmental benefits" },
      { key: "Market", value: "Clear environmental impact potential" },
      { key: "Business Model", value: "Sustainable business model" }
    ],
    required_documents: [
      "Environmental Impact Assessment",
      "Business Plan",
      "Financial Statements (2 years)",
      "Team CVs",
      "Green Technology Documentation",
      "Environmental Benefits Report"
    ],
    description: "The MGTC Green Technology Fund supports Malaysian companies developing environmentally friendly technologies and solutions. This program provides funding to accelerate the adoption of green technologies and contribute to Malaysia's sustainability goals and carbon reduction targets."
  }
}


export default function GrantDetails() {
  const params = useParams()
  const grantId = params.id as string
  const grant = GRANT_DATA[grantId as keyof typeof GRANT_DATA]
  const currentGrant = GRANT_DATA[grantId as keyof typeof GRANT_DATA]

  // State for managing dynamic lists
  const [eligibilityRules, setEligibilityRules] = useState(currentGrant?.eligibility_rules || [])
  const [requiredDocuments, setRequiredDocuments] = useState(currentGrant?.required_documents || [])
  const [sectorTags, setSectorTags] = useState(currentGrant?.sector_tags || [])
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [isEditingRules, setIsEditingRules] = useState(false)
  const [isEditingDocs, setIsEditingDocs] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [newRule, setNewRule] = useState("")
  const [newDoc, setNewDoc] = useState("")

  // Functions to handle adding and removing items
  const addTag = () => {
    if (newTag.trim()) {
      setSectorTags([...sectorTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setSectorTags(sectorTags.filter((_, i) => i !== index))
  }

  const addRule = () => {
    if (newRule.trim()) {
      setEligibilityRules([...eligibilityRules, { key: newRule.trim(), value: "" }])
      setNewRule("")
    }
  }

  const removeEligibilityRule = (index: number) => {
    setEligibilityRules(eligibilityRules.filter((_, i) => i !== index))
  }

  const addDocument = () => {
    if (newDoc.trim()) {
      setRequiredDocuments([...requiredDocuments, newDoc.trim()])
      setNewDoc("")
    }
  }

  const removeRequiredDocument = (index: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index))
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
            <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 flex-1">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="flex-shrink-0">Grants</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <span className="text-blue-600 truncate max-w-[200px]">{MOCK_GRANTS.find(g => g.id === grantId)?.logo} {grant.issuer}</span>
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
              <Link key={grantItem.id} href={`/funder/grant/${grantItem.id}`}>
                <div
                  className={`p-3 transition-all duration-200 cursor-pointer group border-b border-gray-100 last:border-b-0 ${
                    grantItem.id === grantId
                      ? "bg-gray-100 hover:bg-gray-200 !important"
                      : "hover:bg-gray-50 !important"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                            // Static content for non-selected items
                            <div className="marquee-content">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 font-mono">GRANT-{grantItem.id}</span>
                                <span className="text-sm font-medium text-gray-900">{grantItem.title}</span>
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
            {/* Grant Overview */}
            <div className="mb-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 font-serif">{currentGrant?.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{currentGrant?.grant_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>RM {currentGrant?.amount_min?.toLocaleString()} - RM {currentGrant?.amount_max?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(currentGrant?.deadline || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={currentGrant?.status === 'open' ? 'default' : currentGrant?.status === 'closed' ? 'destructive' : 'secondary'}
                      className={currentGrant?.status === 'open' ? 'bg-blue-600 hover:bg-blue-700 text-white py-1.5' : 'py-1.5'}
                    >
                      {currentGrant?.status?.charAt(0).toUpperCase() + currentGrant?.status?.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Fund
                  </Button>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-4">Grant Description</h2>
              <p className="text-gray-700 leading-relaxed mb-8 italic">{currentGrant?.description}</p>
            </div>

            {/* Auto-generated Tags */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Auto-generated Tags</h2>
                {!isEditingTags ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingTags(true)} className="!p-0 text-gray-600 hover:text-gray-900">
                    Edit
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingTags(false)}
                    className="!p-0 text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {sectorTags.map((tag: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <Badge className="bg-blue-50 text-blue-700 rounded-md font-mono py-1.5 px-2">
                      {tag}
                    </Badge>
                    {isEditingTags && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 !p-0 h-6 w-6 text-gray-400 hover:text-gray-700"
                        onClick={() => removeTag(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {isEditingTags && (
                  <div className="flex items-center">
                    {newTag ? (
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        onBlur={addTag}
                        placeholder="New tag..."
                        className="h-8 w-24 text-sm font-mono"
                        autoFocus
                      />
                    ) : (
                      <Badge className="bg-gray-50 text-gray-400 rounded-md font-mono border-2 border-dashed border-gray-300 cursor-pointer hover:text-gray-600 hover:border-gray-400" onClick={() => setNewTag(" ")}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Eligibility Rules */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Eligibility Rules</h2>
                {!isEditingRules ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingRules(true)} className="!p-0 text-gray-600 hover:text-gray-900">
                    Edit
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingRules(false)}
                    className="!p-0 text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="bg-white rounded-xl p-4 space-y-3">
                {eligibilityRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-3 group pb-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-900">{rule.key}</span>
                    {isEditingRules && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto !p-0 text-gray-400 hover:text-gray-700"
                        onClick={() => removeEligibilityRule(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditingRules && (
                  <div className="flex items-center">
                    {newRule ? (
                      <Input
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRule()}
                        onBlur={addRule}
                        placeholder="New rule..."
                        className="h-8 text-sm font-mono w-full"
                        autoFocus
                      />
                    ) : (
                      <div className="w-full">
                        <Badge className="bg-gray-50 text-gray-400 rounded-md font-mono border-2 border-dashed border-gray-300 cursor-pointer hover:text-gray-600 hover:border-gray-400 w-full flex items-center justify-center py-1" onClick={() => setNewRule(" ")}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Required Documents */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Required Documents</h2>
                {!isEditingDocs ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingDocs(true)} className="!p-0 text-gray-600 hover:text-gray-900">
                    Edit
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingDocs(false)}
                    className="!p-0 text-gray-400 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="bg-white rounded-xl p-4 space-y-3">
                {requiredDocuments.map((document, index) => (
                  <div key={index} className="flex items-center gap-3 group pb-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-900">{document}</span>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                    {isEditingDocs && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto !p-0 text-gray-400 hover:text-gray-700"
                        onClick={() => removeRequiredDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditingDocs && (
                  <div className="flex items-center">
                    {newDoc ? (
                      <Input
                        value={newDoc}
                        onChange={(e) => setNewDoc(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addDocument()}
                        onBlur={addDocument}
                        placeholder="New document..."
                        className="h-8 text-sm font-mono w-full"
                        autoFocus
                      />
                    ) : (
                      <div className="w-full">
                        <Badge className="bg-gray-50 text-gray-400 rounded-md font-mono border-2 border-dashed border-gray-300 cursor-pointer hover:text-gray-600 hover:border-gray-400 w-full flex items-center justify-center py-1" onClick={() => setNewDoc(" ")}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
