"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Building2,
  Home,
  Search,
  FileText,
  MessageCircle,
  Upload,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Target,
} from "lucide-react"

interface SidebarLayoutProps {
  children: React.ReactNode
}

const SME_NAVIGATION = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/sme/dashboard", icon: Home },
      { name: "Find Grants", href: "/sme/goal-input", icon: Search },
      { name: "Results", href: "/sme/results", icon: FileText },
      { name: "Grant Assistant", href: "/sme/grant-assistant", icon: Target },
    ],
  },
  {
    title: "Profile",
    items: [
      { name: "Onboarding", href: "/sme/onboarding", icon: User },
    ],
  },
  {
    title: "Support",
    items: [{ name: "Chat Support", href: "/sme/chat/1", icon: MessageCircle }],
  },
  {
    title: "Auth (Dev)",
    items: [
      { name: "Login", href: "/login", icon: User },
      { name: "Register", href: "/register", icon: User },
    ],
  },
]

const FUNDER_NAVIGATION = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/funder/dashboard", icon: Home },
      //{ name: "Upload Document", href: "/funder/upload-document", icon: Upload },
      { name: "Grant Management", href: "/funder/upload", icon: FileText },
    ],
  },
  {
    title: "Profile",
    items: [
      { name: "Onboarding", href: "/funder/onboarding", icon: User },
    ],
  },
  {
    title: "Auth (Dev)",
    items: [
      { name: "Login", href: "/login", icon: User },
      { name: "Register", href: "/register", icon: User },
    ],
  },
]

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Determine user type based on current path
  const isFunder = pathname.startsWith("/funder")
  const navigation = isFunder ? FUNDER_NAVIGATION : SME_NAVIGATION

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-14 items-center px-4">
        <Link href="/role-selector" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500 shadow-sm">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && <span className="text-base font-medium text-gray-900">FundConnect</span>}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3">
        <div className="space-y-8">
          {navigation.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="mb-3 px-2 text-xs font-medium text-gray-500 tracking-wide">
                  {section.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center space-x-3 rounded-md px-2.5 py-2 text-sm transition-all duration-150 group",
                          isActive 
                            ? "bg-gray-200 text-gray-900 shadow-sm" 
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        )}
                      >
                        <Icon className={cn(
                          "h-4 w-4 flex-shrink-0 transition-colors",
                          isActive ? "text-gray-700" : "text-gray-500 group-hover:text-gray-700"
                        )} />
                        {!collapsed && <span className="font-medium">{item.name}</span>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
            <User className="h-3.5 w-3.5 text-gray-600" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{isFunder ? "Funder Account" : "SME Account"}</p>
              <p className="text-xs text-gray-500 truncate">
                {isFunder ? "funder@example.com" : "startup@example.com"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden bg-white transition-all duration-300 lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-gray-200 bg-white p-0 shadow-md hover:bg-gray-50"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3 text-gray-600" /> : <ChevronLeft className="h-3 w-3 text-gray-600" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Mobile Header */}
        <div className="flex h-14 items-center bg-white px-4 lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)} className="mr-3 hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          <Link href="/role-selector" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 shadow-sm">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-medium text-gray-900">FundConnect</span>
          </Link>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-white">{children}</main>
      </div>
    </div>
  )
}
