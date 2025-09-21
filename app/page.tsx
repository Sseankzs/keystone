import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Connect Startups with the Right Funding
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Our AI-powered platform matches innovative startups with suitable funders, streamlining the funding process
            for both entrepreneurs and investors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sme/onboarding">
              <Button size="lg" className="w-full sm:w-auto">
                I'm a Startup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/funder/upload-document">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                I'm a Funder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold font-serif text-center mb-12 text-balance">Why Choose Keystone?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-pretty">
                  Our AI analyzes your business profile and matches you with the most relevant funding opportunities.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Streamlined Process</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-pretty">
                  Simplified application process with guided steps and real-time chat support for questions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Secure & Trusted</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-pretty">
                  Enterprise-grade security with verified funders and comprehensive due diligence support.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-balance">Ready to Find Your Perfect Match?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Join thousands of startups and funders who have successfully connected through our platform.
          </p>
          <Link href="/register">
            <Button size="lg">
              Start Your Journey Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
