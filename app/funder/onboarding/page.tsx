"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, MapPin, ArrowRight, ArrowLeft, DollarSign } from "lucide-react"

const ORGANIZATION_TYPES = [
  "Government Agency",
  "Private Foundation",
  "Corporate Foundation",
  "Venture Capital",
  "Angel Investor Network",
  "Development Bank",
  "Non-Profit Organization",
  "University/Research Institution",
  "Other",
]

const FUNDING_FOCUS_AREAS = [
  "Technology & Innovation",
  "Healthcare & Life Sciences",
  "Clean Energy & Environment",
  "Education & Training",
  "Financial Services",
  "Manufacturing & Industry",
  "Agriculture & Food",
  "Social Impact",
  "Research & Development",
  "Infrastructure",
]

export default function FunderOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    description: "",
    website: "",
    location: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    focusAreas: [] as string[],
    typicalGrantSize: "",
    annualBudget: "",
    applicationProcess: "",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFocusAreaToggle = (area: string) => {
    const currentAreas = formData.focusAreas
    if (currentAreas.includes(area)) {
      handleInputChange(
        "focusAreas",
        currentAreas.filter((a) => a !== area),
      )
    } else {
      handleInputChange("focusAreas", [...currentAreas, area])
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    // TODO: Save funder profile data to backend
    console.log("Funder profile data:", formData)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/funder/dashboard")
    }, 1000)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="organizationName"
                  placeholder="Enter your organization name"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange("organizationName", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationType">Organization Type *</Label>
              <Select
                value={formData.organizationType}
                onValueChange={(value) => handleInputChange("organizationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  {ORGANIZATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Organization Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your organization's mission and funding objectives..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourorg.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Primary Contact Person *</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactPerson"
                  placeholder="Full name"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@yourorg.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Focus Areas *</Label>
              <p className="text-sm text-muted-foreground mb-3">Select all areas your organization funds</p>
              <div className="grid grid-cols-2 gap-2">
                {FUNDING_FOCUS_AREAS.map((area) => (
                  <div
                    key={area}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.focusAreas.includes(area)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => handleFocusAreaToggle(area)}
                  >
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typicalGrantSize">Typical Grant Size *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={formData.typicalGrantSize}
                    onValueChange={(value) => handleInputChange("typicalGrantSize", value)}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<50k">Less than $50k</SelectItem>
                      <SelectItem value="50k-100k">$50k - $100k</SelectItem>
                      <SelectItem value="100k-250k">$100k - $250k</SelectItem>
                      <SelectItem value="250k-500k">$250k - $500k</SelectItem>
                      <SelectItem value="500k-1m">$500k - $1M</SelectItem>
                      <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                      <SelectItem value="5m+">$5M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="annualBudget">Annual Funding Budget</Label>
                <Select
                  value={formData.annualBudget}
                  onValueChange={(value) => handleInputChange("annualBudget", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<1m">Less than $1M</SelectItem>
                    <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                    <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                    <SelectItem value="50m+">$50M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationProcess">Application Process Description</Label>
              <Textarea
                id="applicationProcess"
                placeholder="Describe your typical application and review process..."
                value={formData.applicationProcess}
                onChange={(e) => handleInputChange("applicationProcess", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4 text-lg">Profile Summary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <strong className="text-foreground">Organization:</strong>
                  <p className="text-muted-foreground mt-1">{formData.organizationName || "Not specified"}</p>
                </div>
                <div>
                  <strong className="text-foreground">Type:</strong>
                  <p className="text-muted-foreground mt-1">{formData.organizationType || "Not specified"}</p>
                </div>
                <div>
                  <strong className="text-foreground">Location:</strong>
                  <p className="text-muted-foreground mt-1">{formData.location || "Not specified"}</p>
                </div>
                <div>
                  <strong className="text-foreground">Contact Person:</strong>
                  <p className="text-muted-foreground mt-1">{formData.contactPerson || "Not specified"}</p>
                </div>
                <div>
                  <strong className="text-foreground">Contact Email:</strong>
                  <p className="text-muted-foreground mt-1">{formData.contactEmail || "Not specified"}</p>
                </div>
                <div>
                  <strong className="text-foreground">Focus Areas:</strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.focusAreas.length > 0 ? (
                      formData.focusAreas.map((area) => (
                        <span
                          key={area}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-dashed border-blue-200"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground">None selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <strong className="text-foreground">Typical Grant Size:</strong>
                  <p className="text-muted-foreground mt-1">{formData.typicalGrantSize || "Not specified"}</p>
                </div>
                <div>
                  <strong className="text-foreground">Annual Budget:</strong>
                  <p className="text-muted-foreground mt-1">{formData.annualBudget || "Not specified"}</p>
                </div>
                {formData.applicationProcess && (
                  <div>
                    <strong className="text-foreground">Application Process:</strong>
                    <p className="text-muted-foreground mt-1">{formData.applicationProcess}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.organizationName && formData.organizationType && formData.description && formData.location
      case 2:
        return formData.contactPerson && formData.contactEmail && formData.focusAreas.length > 0
      case 3:
        return formData.typicalGrantSize
      case 4:
        return true // Review step is always valid
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 overflow-y-auto">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-serif">Keystone</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Setup Your Funder Profile</h1>
          <p className="text-muted-foreground">Help startups discover your funding opportunities</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Organization Information"}
              {currentStep === 2 && "Contact & Focus Areas"}
              {currentStep === 3 && "Funding Details"}
              {currentStep === 4 && "Review Profile"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your organization and mission"}
              {currentStep === 2 && "Provide contact details and funding focus areas"}
              {currentStep === 3 && "Set your funding parameters and application process"}
              {currentStep === 4 && "Review your complete profile before finalizing"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!isStepValid() || isLoading}>
                  {isLoading ? "Creating Profile..." : "Complete Setup"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
