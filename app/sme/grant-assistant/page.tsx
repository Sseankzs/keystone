"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Circle, Send, Bot, User, FileText, DollarSign, Building, Clock, ChevronDown, ChevronUp, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodoItem {
  id: string
  title: string
  description: string
  completed: boolean
  category: "documents" | "business" | "financial" | "timeline"
}

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

const INITIAL_TODOS: TodoItem[] = [
  {
    id: "1",
    title: "Prepare Business Plan",
    description:
      "Create a comprehensive business plan outlining your company vision, market analysis, and growth strategy",
    completed: false,
    category: "documents",
  },
  {
    id: "2",
    title: "Financial Statements (Last 2 Years)",
    description: "Gather profit & loss statements, balance sheets, and cash flow statements",
    completed: false,
    category: "financial",
  },
  {
    id: "3",
    title: "Company Registration Documents",
    description: "Certificate of incorporation, articles of association, and shareholder agreements",
    completed: false,
    category: "documents",
  },
  {
    id: "4",
    title: "Define Funding Requirements",
    description: "Clearly outline how much funding you need and how it will be used",
    completed: false,
    category: "business",
  },
  {
    id: "5",
    title: "Market Research Report",
    description: "Demonstrate understanding of your target market and competitive landscape",
    completed: false,
    category: "business",
  },
  {
    id: "6",
    title: "Set Application Timeline",
    description: "Plan your application submission timeline with buffer for reviews",
    completed: false,
    category: "timeline",
  },
]

const CATEGORY_ICONS = {
  documents: FileText,
  business: Building,
  financial: DollarSign,
  timeline: Clock,
}

const CATEGORY_COLORS = {
  documents: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  business: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  financial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  timeline: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export default function GrantAssistantPage() {
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hi! I'm your Grant Application Assistant. I'll help you prepare everything needed for your grant application. Let's start by reviewing your to-do list. What would you like to know about any of these requirements?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isTodoCollapsed, setIsTodoCollapsed] = useState(true)

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length
  const progressPercentage = (completedCount / totalCount) * 100

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputMessage),
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("business plan")) {
      return "For your business plan, include: 1) Executive summary, 2) Market analysis, 3) Financial projections for 3-5 years, 4) Management team details, 5) Product/service description. Most funders want to see realistic growth projections and clear market opportunity. Would you like specific guidance on any section?"
    }

    if (lowerInput.includes("financial") || lowerInput.includes("statements")) {
      return "Financial statements should include: Profit & Loss for last 2 years, Balance Sheet, Cash Flow Statement, and Tax Returns. Make sure they're audited or reviewed by a CPA if possible. Also prepare a detailed budget showing how you'll use the grant funds."
    }

    if (lowerInput.includes("timeline") || lowerInput.includes("deadline")) {
      return "I recommend starting your application 6-8 weeks before the deadline. This gives you time for: 1) Document preparation (2-3 weeks), 2) Application writing (2-3 weeks), 3) Review and revisions (1-2 weeks). Would you like help creating a detailed timeline?"
    }

    if (lowerInput.includes("market research")) {
      return "Your market research should cover: 1) Total addressable market size, 2) Target customer segments, 3) Competitive analysis, 4) Market trends and growth projections. Use credible sources like industry reports, government data, and surveys. This shows funders you understand your market opportunity."
    }

    return "That's a great question! I can help you with any aspect of grant preparation. Feel free to ask about specific documents, requirements, or strategies. You can also click on any to-do item to get detailed guidance on completing it."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Full Page Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">Grant Application Assistant</h1>
              <p className="text-sm text-muted-foreground">Get personalized guidance for your grant application</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex space-x-3", message.sender === "user" && "justify-end")}>
                {message.sender === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.sender === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Combined Todo + Chat Input Section */}
        <div className="relative p-4">
          <div className="max-w-4xl mx-auto">
            {/* Todo Section - Slightly narrower */}
            <div className="relative w-[calc(100%-2rem)] mx-auto">
              {/* Todo Header */}
              <div 
                className={cn(
                  "p-4 cursor-pointer hover:bg-muted/50 transition-colors bg-muted/30 border border-border",
                  isTodoCollapsed ? "rounded-t-2xl border-b-0" : "rounded-t-2xl"
                )}
                onClick={() => setIsTodoCollapsed(!isTodoCollapsed)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-4 bg-primary rounded-full" />
                      <h3 className="text-sm font-medium">Grant Preparation Tasks</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {completedCount}/{totalCount}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {isTodoCollapsed ? "Show tasks" : "Hide tasks"}
                    </span>
                    {isTodoCollapsed ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Collapsible Todo List - Expands downward */}
              {!isTodoCollapsed && (
                <div className="bg-muted/20 border-l border-r border-b border-border rounded-b-2xl shadow-lg">
                  <div className="p-4">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {todos.map((todo) => {
                        const CategoryIcon = CATEGORY_ICONS[todo.category]
                        return (
                          <div
                            key={todo.id}
                            className={cn(
                              "flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-muted/30 transition-colors group",
                              todo.completed && "opacity-60"
                            )}
                            onClick={() => toggleTodo(todo.id)}
                          >
                            <div className="flex-shrink-0">
                              {todo.completed ? (
                                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground group-hover:border-primary transition-colors" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <CategoryIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <Badge variant="secondary" className={cn("text-xs px-2 py-0.5", CATEGORY_COLORS[todo.category])}>
                                  {todo.category}
                                </Badge>
                              </div>
                              <h4
                                className={cn(
                                  "text-sm font-medium leading-tight",
                                  todo.completed && "line-through text-muted-foreground",
                                )}
                              >
                                {todo.title}
                              </h4>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Text Box - Seamlessly connected to todo */}
            <div className={cn(
              "relative border border-border bg-background shadow-sm z-10",
              isTodoCollapsed ? "rounded-2xl" : "rounded-b-2xl border-t-0"
            )}>
              <div className="flex items-start p-3 gap-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about grant requirements, documents, or application strategies..."
                    className="w-full min-h-[2.5em] max-h-[40vh] resize-none outline-none bg-transparent placeholder:text-muted-foreground text-foreground font-sans text-sm"
                    rows={1}
                    style={{
                      minHeight: '2.5em',
                      maxHeight: '40vh',
                      overflow: 'auto'
                    }}
                  />
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage("How do I write a compelling business plan?")}
                className="text-xs h-8 px-3"
              >
                Business Plan Tips
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setInputMessage("What financial documents do I need?")}
                className="text-xs h-8 px-3"
              >
                Financial Requirements
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage("Help me create an application timeline")}
                className="text-xs h-8 px-3"
              >
                Timeline Planning
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
