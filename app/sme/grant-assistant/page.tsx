"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Send, FileText, DollarSign, Building, Clock, Paperclip, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodoItem {
  id: string
  title: string
  description: string
  completed: boolean
  category: "documents" | "business" | "financial" | "timeline"
  timeLimit?: string
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
    timeLimit: "2 weeks",
  },
  {
    id: "2",
    title: "Financial Statements (Last 2 Years)",
    description: "Gather profit & loss statements, balance sheets, and cash flow statements",
    completed: false,
    category: "financial",
    timeLimit: "1 week",
  },
  {
    id: "3",
    title: "Company Registration Documents",
    description: "Certificate of incorporation, articles of association, and shareholder agreements",
    completed: false,
    category: "documents",
    timeLimit: "3 days",
  },
  {
    id: "4",
    title: "Define Funding Requirements",
    description: "Clearly outline how much funding you need and how it will be used",
    completed: false,
    category: "business",
    timeLimit: "1 week",
  },
  {
    id: "5",
    title: "Market Research Report",
    description: "Demonstrate understanding of your target market and competitive landscape",
    completed: false,
    category: "business",
    timeLimit: "2 weeks",
  },
  {
    id: "6",
    title: "Set Application Timeline",
    description: "Plan your application submission timeline with buffer for reviews",
    completed: false,
    category: "timeline",
    timeLimit: "2 days",
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
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold">Grant Application Assistant</h1>
          <p className="text-sm text-muted-foreground">Get personalized guidance for your grant application</p>
        </div>
      </div>

      {/* Main Content Area - Chat + Fixed Todo Section */}
      <div className="flex-1 relative min-h-0">
        {/* Chat Messages - Scrollable */}
        <ScrollArea className="h-full p-3 pb-0">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.sender === "user" && "justify-end")}>
                {message.sender === "user" ? (
                  <div className={cn(
                    "max-w-[80%] px-4 py-3 bg-primary text-primary-foreground",
                    message.content.split('\n').length === 1 && message.content.length < 50 
                      ? "rounded-full" 
                      : "rounded-2xl"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[80%]">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex">
                <div className="max-w-[80%]">
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

        {/* Fixed Todo Section - Positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-background z-10">
          <div className="p-0">
            <div className="max-w-4xl mx-auto">
              {/* Integrated Todo + Text Input */}
              <div className="relative">
              {/* Collapsible Todo Section - Complete section above text input */}
              {!isTodoCollapsed && (
                <div className="bg-transparent border border-border rounded-t-2xl shadow-sm mb-0">
                    {/* Todo Header - Inside the todo section */}
                    <div
                      className="flex items-center justify-between p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors rounded-t-2xl"
                      onClick={() => setIsTodoCollapsed(!isTodoCollapsed)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Grant Tasks</span>
                          <Badge variant="secondary" className="text-xs">
                            {completedCount}/{totalCount}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">Hide</span>
                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Todo Content */}
                    <div className="p-4">
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {todos.map((todo) => {
                          return (
                            <div
                              key={todo.id}
                              className={cn(
                                "flex items-center justify-between p-3 cursor-pointer transition-all duration-200 hover:bg-muted/50 rounded-lg",
                                todo.completed && "opacity-75"
                              )}
                              onClick={() => toggleTodo(todo.id)}
                            >
                              {/* Left side: Checkbox, Title, and Time limit */}
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  {todo.completed ? (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                      <CheckCircle2 className="h-3 w-3 text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground hover:border-primary transition-colors" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <h4 className={cn(
                                    "text-sm font-medium",
                                    todo.completed && "line-through text-muted-foreground"
                                  )}>
                                    {todo.title}
                                  </h4>
                                  <span className={cn(
                                    "text-xs text-muted-foreground whitespace-nowrap",
                                    todo.completed && "line-through"
                                  )}>
                                    {todo.timeLimit}
                                  </span>
                                </div>
                              </div>

                              {/* Right side: Tags and Arrow */}
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <Badge variant="secondary" className={cn("text-xs", CATEGORY_COLORS[todo.category])}>
                                  {todo.category}
                                </Badge>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Add arrow click functionality
                                  }}
                                  className="p-1 hover:bg-muted/50 rounded transition-colors"
                                >
                                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Input */}
                <div className="relative">
                  {/* Show Todo Button - When collapsed */}
                  {isTodoCollapsed && (
                    <div
                      className="flex items-center justify-between p-3 mb-0 border border-border border-b-0 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-2xl bg-background"
                      onClick={() => setIsTodoCollapsed(!isTodoCollapsed)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Grant Tasks</span>
                          <Badge variant="secondary" className="text-xs">
                            {completedCount}/{totalCount}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-muted rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(progressPercentage)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">Show</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Text Input Area */}
                  <div className={cn(
                    "bg-background border border-border shadow-sm focus-within:shadow-md focus-within:border-primary/50 transition-all duration-200 mb-6",
                    isTodoCollapsed ? "rounded-2xl" : "rounded-b-2xl border-t-0"
                  )}>
                    <div className="flex items-end gap-3 p-4">
                      <div className="flex-1">
                        <textarea
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your grant application..."
                          className="w-full min-h-[2.5rem] max-h-[8rem] resize-none bg-transparent border-0 outline-none placeholder:text-muted-foreground text-sm leading-relaxed"
                          rows={1}
                          style={{
                            minHeight: '2.5rem',
                            maxHeight: '8rem',
                            overflow: 'auto'
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 rounded-full hover:bg-muted"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          size="sm"
                          className="h-9 w-9 rounded-full"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
