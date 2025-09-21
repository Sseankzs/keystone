"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Briefcase, Target } from "lucide-react"

export default function RoleSelectorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="text-4xl font-bold font-serif">Keystone</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Choose Your Role</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select whether you're looking for funding opportunities or managing grant programs
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* SME Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-foreground">SME / Startup</CardTitle>
              <CardDescription className="text-base">
                Small and medium enterprises looking for funding opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Find matching grants</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>Track applications</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Get funding assistance</span>
                </div>
              </div>
              <Link href="/sme/dashboard" className="block">
                <Button className="w-full" size="lg" variant="outline">
                  Enter as SME
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Funder Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-foreground">Funder / Organization</CardTitle>
              <CardDescription className="text-base">
                Organizations managing grant programs and funding opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>Manage grant programs</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Review applications</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Track funding metrics</span>
                </div>
              </div>
              <Link href="/funder/dashboard" className="block">
                <Button className="w-full" size="lg" variant="outline">
                  Enter as Funder
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            This is a temporary role selector. In production, users would be automatically routed based on their account type.
          </p>
        </div>
      </div>
    </div>
  )
}
