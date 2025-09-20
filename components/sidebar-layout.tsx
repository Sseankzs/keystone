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
  Building,
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
    title: "SME Flow",
    items: [
      { name: "Onboarding", href: "/sme/onboarding", icon: User },
      { name: "Dashboard", href: "/sme/dashboard", icon: Home },
      { name: "Grant Details", href: "/sme/grant/1", icon: Target },
    ],
  },
]

const FUNDER_NAVIGATION = [
  {
    title: "Funder Flow",
    items: [
      { name: "Onboarding", href: "/funder/onboarding", icon: User },
      { name: "Dashboard", href: "/funder/dashboard", icon: Home },
      { name: "Grant Details", href: "/funder/grant/1", icon: FileText },
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
    <div className="flex h-full flex-col bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="flex h-14 items-center px-4 bg-white border-b border-gray-200">
        <Link href="/role-selector" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-semibold text-gray-900">FundConnect</span>}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h3 className="mb-3 px-3 text-xs font-semibold text-gray-500 tracking-wider uppercase">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 group",
                          isActive
                            ? "bg-blue-100 text-blue-900 shadow-sm border border-blue-200"
                            : "text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200",
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 flex-shrink-0 transition-colors",
                          isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
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
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 border border-gray-200">
            <User className="h-4 w-4 text-gray-600" />
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
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden bg-gray-50 transition-all duration-300 lg:block",
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
          <div className="fixed left-0 top-0 h-full w-64 bg-gray-50 shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {/* Mobile Header */}
        <div className="flex h-14 items-center bg-white border-b border-gray-200 px-4 lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)} className="mr-3 hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          <Link href="/role-selector" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">FundConnect</span>
          </Link>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-white">{children}</main>
      </div>
    </div>
  )
}
