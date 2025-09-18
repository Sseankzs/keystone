"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { MessageCircle, Send, X, FileText, Loader2, Bot, User } from "lucide-react"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: Citation[]
}

interface Citation {
  id: string
  text: string
  source: string
  page?: number
}

interface ChatWidgetProps {
  grantId: string
  grantTitle: string
  isOpen?: boolean
  onClose?: () => void
}

// Mock citations data
const MOCK_CITATIONS: Citation[] = [
  {
    id: "1",
    text: "Applicants must submit a comprehensive business plan including financial projections for the next 3 years.",
    source: "Grant Requirements Document",
    page: 3,
  },
  {
    id: "2",
    text: "The maximum funding amount available under this grant is $500,000 per applicant.",
    source: "Grant Guidelines",
    page: 1,
  },
  {
    id: "3",
    text: "Applications must be submitted by March 15, 2024, at 11:59 PM EST.",
    source: "Application Deadline Notice",
    page: 1,
  },
]

export function ChatWidget({ grantId, grantTitle, isOpen = false, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: `Hello! I'm here to help you with questions about the "${grantTitle}" grant. You can ask me about eligibility requirements, application process, deadlines, or any other details. How can I assist you?`,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCitations, setShowCitations] = useState(false)
  const [selectedCitations, setSelectedCitations] = useState<Citation[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // TODO: Replace with actual API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateMockResponse(inputValue),
        timestamp: new Date(),
        citations: MOCK_CITATIONS.slice(0, Math.floor(Math.random() * 3) + 1),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("deadline") || lowerQuestion.includes("when")) {
      return "The application deadline for this grant is March 15, 2024, at 11:59 PM EST. Make sure to submit all required documents before this date to be considered for funding."
    }

    if (lowerQuestion.includes("amount") || lowerQuestion.includes("funding") || lowerQuestion.includes("money")) {
      return "The maximum funding amount available under this grant is $500,000 per applicant. The actual amount awarded will depend on your project scope, budget requirements, and evaluation score."
    }

    if (lowerQuestion.includes("requirement") || lowerQuestion.includes("document") || lowerQuestion.includes("need")) {
      return "You'll need to submit a comprehensive business plan with 3-year financial projections, technical documentation, team CVs, and market analysis. All documents should be in PDF format and clearly labeled."
    }

    if (lowerQuestion.includes("eligible") || lowerQuestion.includes("qualify")) {
      return "To be eligible, your company must be incorporated, have a working product or prototype, and demonstrate market traction. You should also be in the technology sector with a focus on AI or automation solutions."
    }

    return "I'd be happy to help you with that question about the grant. Could you please be more specific about what aspect you'd like to know more about? I can provide information about eligibility, requirements, deadlines, funding amounts, and the application process."
  }

  const handleShowCitations = (citations: Citation[]) => {
    setSelectedCitations(citations)
    setShowCitations(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-sm">Grant Assistant</h3>
            <p className="text-xs text-muted-foreground">{grantTitle}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === "assistant" && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  {message.type === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm">{message.content}</p>
                    {message.citations && message.citations.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto p-1 text-xs hover:bg-transparent"
                        onClick={() => handleShowCitations(message.citations!)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        See sources ({message.citations.length})
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this grant..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ask about eligibility, requirements, deadlines, or application process
        </p>
      </div>

      {/* Citations Drawer */}
      <Drawer open={showCitations} onOpenChange={setShowCitations}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Sources & Citations</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {selectedCitations.map((citation) => (
              <Card key={citation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {citation.source}
                    </Badge>
                    {citation.page && <span className="text-xs text-muted-foreground">Page {citation.page}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{citation.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => {}}
          className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl transition-shadow"
          size="sm"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-96 h-[500px] shadow-xl">
          <ChatContent />
        </Card>
      )}
    </div>
  )
}

// Standalone chat page component
export function ChatPage({ grantId, grantTitle }: { grantId: string; grantTitle: string }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px]">
            <ChatWidget grantId={grantId} grantTitle={grantTitle} isOpen={true} />
          </Card>
        </div>
      </div>
    </div>
  )
}
