"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, LinkIcon, Globe, ClipboardPaste, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function FunderUploadPage() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleContinue = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    
    try {
      // Process each uploaded file
      for (const file of uploadedFiles) {
        console.log(`Processing ${file.name}...`)
        
        // Convert file to base64
        const fileBuffer = await file.arrayBuffer()
        const base64Content = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)))
        
        // Call your API endpoint
        const response = await fetch('https://b4lzhuuhk1.execute-api.ap-southeast-1.amazonaws.com/upload-grant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            issuer: "dept-commerce-123", // You can make this dynamic later
            pdf_content: base64Content
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}: ${response.status}`)
        }

        const result = await response.json()
        console.log(`Successfully uploaded ${file.name}:`, result)
      }

      // Navigate to onboarding after successful upload
      router.push("/funder/onboarding")
      
    } catch (error) {
      console.error('Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Upload failed: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold">FundConnect</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Add grant documents</h1>
            <Button variant="outline" className="text-slate-400 border-slate-600 hover:bg-slate-800 bg-transparent">
              <Globe className="h-4 w-4 mr-2" />
              Discover sources
            </Button>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Upload your grant documents to help us extract key information and create your funding profile.
          </p>
          <p className="text-slate-500 text-sm mt-1">
            (Examples: grant guidelines, application forms, funding criteria, eligibility requirements, etc.)
          </p>
        </div>

        {/* Main Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors mb-8",
            dragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-600 hover:border-slate-500",
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Upload grant documents</h3>
              <p className="text-slate-400">
                Drag and drop or{" "}
                <label className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
                  choose file to upload
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.mp3"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </p>
            </div>
            <p className="text-sm text-slate-500">Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)</p>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alternative Upload Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                  <Globe className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Google Workspace</p>
                  <p className="text-xs text-slate-500">Google Drive</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                  <LinkIcon className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Link</p>
                  <p className="text-xs text-slate-500">Website • YouTube</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                  <ClipboardPaste className="h-4 w-4 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Paste text</p>
                  <p className="text-xs text-slate-500">Copied text</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Source Limit */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-700 rounded-sm flex items-center justify-center">
              <FileText className="h-3 w-3 text-slate-400" />
            </div>
            <span className="text-sm text-slate-400">Source limit</span>
          </div>
          <span className="text-sm text-slate-500">{uploadedFiles.length}/50</span>
        </div>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={uploadedFiles.length === 0 || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isProcessing ? "Processing..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
