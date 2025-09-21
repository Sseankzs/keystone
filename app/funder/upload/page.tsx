"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Upload, LinkIcon, FileText, Tag, CheckCircle, ArrowLeft, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for auto-generated tags and checklist
const MOCK_TAGS = ["Technology", "AI/ML", "Startups", "Innovation", "Series A", "B2B", "SaaS", "Growth Stage"]

const MOCK_CHECKLIST = [
  { item: "Business plan required", required: true },
  { item: "Financial projections (3 years)", required: true },
  { item: "Technical documentation", required: true },
  { item: "Team CVs and backgrounds", required: true },
  { item: "Market analysis", required: false },
  { item: "Customer testimonials", required: false },
  { item: "Intellectual property documentation", required: false },
  { item: "Regulatory compliance certificates", required: false },
]

const MOCK_FAQS = [
  {
    question: "What is the maximum funding amount available?",
    answer: "This grant provides up to $500,000 for qualifying technology startups in Series A stage.",
  },
  {
    question: "What are the eligibility criteria?",
    answer:
      "Companies must be incorporated, have a working product, and demonstrate market traction with at least $100k ARR.",
  },
  {
    question: "How long is the application review process?",
    answer: "The review process typically takes 6-8 weeks from submission to final decision.",
  },
  {
    question: "Are there any geographic restrictions?",
    answer: "This grant is available to companies incorporated in the US, Canada, or EU member states.",
  },
]

export default function GrantUploadPage() {
  const router = useRouter()
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isProcessed, setIsProcessed] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    grantTitle: "",
    description: "",
    url: "",
    file: null as File | null,
  })

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
      // Also set the first file for the form
      if (files[0]) {
        setFormData((prev) => ({ ...prev, file: files[0] }))
      }
    }
  }, [])

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
      // Check if we have a file to process
      if (!formData.file && uploadedFiles.length === 0) {
        throw new Error("Please upload a file to process")
      }

      // Use the file from formData or the first uploaded file
      const fileToProcess = formData.file || uploadedFiles[0]
      
      console.log(`🚀 Processing ${fileToProcess.name} with API...`)
      
      // Convert file to base64
      const fileBuffer = await fileToProcess.arrayBuffer()
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))
      
      // Call your API endpoint
      console.log(`🚀 Calling API for ${fileToProcess.name}...`)
      const response = await fetch('https://b4lzhuuhk1.execute-api.ap-southeast-1.amazonaws.com/dev/upload-grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.grantTitle || fileToProcess.name.replace(/\.[^/.]+$/, ""), // Use form title or filename
          issuer: "hardcoded-issuer", // Hardcoded as requested
          pdf_content: base64Content
        })
      })

      console.log(`📥 Response status: ${response.status} (${response.statusText})`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API Error for ${fileToProcess.name}:`, errorText)
        throw new Error(`Failed to upload ${fileToProcess.name}: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log(`📄 Raw API response for ${fileToProcess.name}:`, result)
      
      // Validate that we got meaningful data back
      if (!result || typeof result !== 'object') {
        throw new Error(`Invalid response format for ${fileToProcess.name}: Expected object, got ${typeof result}`)
      }
      
      // Check if essential fields are present
      const hasTitle = result.title && result.title.trim() !== ''
      const hasIssuer = result.issuer && result.issuer.trim() !== ''
      
      if (!hasTitle || !hasIssuer) {
        console.error(`❌ Analysis failed for ${fileToProcess.name}: Missing essential data`)
        console.error('Response data:', result)
        throw new Error(`Analysis failed for ${fileToProcess.name}: Unable to extract grant information. Please check if the document contains valid grant data.`)
      }
      
      // Log the structured response data
      console.log('✅ Grant data successfully extracted:', {
        title: result.title,
        issuer: result.issuer,
        country: result.country,
        status: result.status,
        deadline: result.deadline,
        amount_min: result.amount_min,
        amount_max: result.amount_max,
        sector_tags: result.sector_tags,
        eligibility_rules: result.eligibility_rules,
        required_documents: result.required_documents
      })

      console.log(`✅ Successfully processed ${fileToProcess.name}`)
      
      // If successful, proceed to the processed view
      setIsProcessing(false)
      setIsProcessed(true)
      
    } catch (error) {
      console.error('❌ Upload process failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Show more detailed error message to user
      if (errorMessage.includes('Analysis failed')) {
        alert(`Document Analysis Failed:\n\n${errorMessage}\n\nPlease try uploading a different document or check that your PDF contains grant information.`)
      } else if (errorMessage.includes('Failed to upload')) {
        alert(`API Error:\n\n${errorMessage}\n\nPlease check your internet connection and try again.`)
      } else {
        alert(`Upload failed: ${errorMessage}`)
      }
      
      setIsProcessing(false)
    }
  }

  const handleSaveGrant = () => {
    // TODO: Save processed grant to database
    console.log("Saving grant with tags and checklist")
    router.push("/funder/dashboard")
  }

  if (isProcessed) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">FundConnect</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Grant Processing Complete</h1>
            <p className="text-muted-foreground">
              Review the auto-generated information and make any necessary adjustments
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tags Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
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
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
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
                  <CheckCircle className="h-5 w-5 text-primary" />
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
                <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Edit Checklist
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQs Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Generated FAQs</CardTitle>
              <CardDescription>Common questions and answers extracted from your grant document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_FAQS.map((faq, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-sm mb-1">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Edit FAQs
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setIsProcessed(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
            <Button onClick={handleSaveGrant}>
              Save Grant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">FundConnect</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Grant Information</h1>
          <p className="text-muted-foreground">
            Upload your grant document or provide a URL. Our AI will extract key information and create matching
            criteria.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grant Document</CardTitle>
            <CardDescription>Provide your grant information via file upload or URL</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grantTitle">Grant Title *</Label>
                  <Input
                    id="grantTitle"
                    placeholder="Enter the grant title"
                    value={formData.grantTitle}
                    onChange={(e) => handleInputChange("grantTitle", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Brief Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief description of the grant..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Upload Method Selection */}
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "file" | "url")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="url">Provide URL</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Grant Document (PDF) *</Label>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className={cn(
                          "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                          dragActive ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Upload className={cn(
                            "h-8 w-8 transition-colors",
                            dragActive ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">Upload grant documents</h3>
                          <p className="text-muted-foreground">
                            Drag and drop or{" "}
                            <label className="text-primary hover:text-primary/80 cursor-pointer underline">
                              choose file to upload
                              <input
                                id="file"
                                type="file"
                                accept=".pdf,.txt,.md"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">Supported file types: PDF, txt, Markdown</p>
                      </div>
                    </div>
                    
                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-foreground mb-3">Uploaded Files</h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-muted-foreground hover:text-foreground"
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

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Grant Document URL *</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com/grant-document.pdf"
                        value={formData.url}
                        onChange={(e) => handleInputChange("url", e.target.value)}
                        className="pl-10"
                        required={uploadMethod === "url"}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Provide a direct link to your grant document (PDF format preferred)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Processing Status */}
              {isProcessing && (
                <div className="bg-muted/50 p-6 rounded-lg text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h3 className="font-semibold mb-2">Processing Grant Document</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI is analyzing your document to extract key information, generate tags, and create application
                    requirements.
                  </p>
                  <Progress value={66} className="max-w-xs mx-auto" />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={
                  isProcessing ||
                  !formData.grantTitle ||
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

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">1. Document Analysis</h4>
                <p className="text-muted-foreground">AI extracts key information from your grant document</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Tag className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">2. Auto-Tagging</h4>
                <p className="text-muted-foreground">Generates relevant tags for startup matching</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-1">3. Requirements List</h4>
                <p className="text-muted-foreground">Creates application checklist for startups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
