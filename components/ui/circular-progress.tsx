import React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  progress: number // 0-100
  size?: "sm" | "md" | "lg"
  strokeWidth?: number
  className?: string
}

export function CircularProgress({ 
  progress, 
  size = "sm", 
  strokeWidth = 2,
  className 
}: CircularProgressProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  const radius = size === "sm" ? 6 : size === "md" ? 8 : 10
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-green-500 animate-progress-fill origin-center"
          style={{
            "--initial-offset": strokeDasharray,
            "--final-offset": strokeDashoffset,
            transform: "rotate(0deg)"
          } as React.CSSProperties}
        />
      </svg>
    </div>
  )
}
