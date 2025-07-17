import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(time: string): string {
  return new Date(`2000-01-01 ${time}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatDateTime(dateTime: string | Date): string {
  return new Date(dateTime).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Time calculation utilities
export function calculateWorkingHours(checkIn: string, checkOut: string): number {
  const checkInTime = new Date(`2000-01-01 ${checkIn}`)
  const checkOutTime = new Date(`2000-01-01 ${checkOut}`)
  const diffMs = checkOutTime.getTime() - checkInTime.getTime()
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100
}

export function getTimeDifference(startTime: string): string {
  const now = new Date()
  const start = new Date(`${now.toDateString()} ${startTime}`)
  const diffMs = now.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  }
  return `${diffMinutes}m`
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
  return phoneRegex.test(phone)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Data processing utilities
export function generateEmployeeId(existingIds: string[]): string {
  let counter = 1
  let newId = `EMP${String(counter).padStart(3, "0")}`

  while (existingIds.includes(newId)) {
    counter++
    newId = `EMP${String(counter).padStart(3, "0")}`
  }

  return newId
}

export function calculateAttendanceRate(present: number, total: number): number {
  if (total === 0) return 0
  return Math.round((present / total) * 100)
}

// Export utilities
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value
        })
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

// Status utilities
export function getAttendanceStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "present":
      return "text-green-600 bg-green-100"
    case "absent":
      return "text-red-600 bg-red-100"
    case "late":
      return "text-yellow-600 bg-yellow-100"
    case "half-day":
      return "text-blue-600 bg-blue-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

export function getLeaveStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "approved":
      return "text-green-600 bg-green-100"
    case "rejected":
      return "text-red-600 bg-red-100"
    case "pending":
      return "text-yellow-600 bg-yellow-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

// Notification utilities
export function showNotification(title: string, body: string, icon?: string): void {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon })
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if ("Notification" in window) {
    return Notification.requestPermission()
  }
  return Promise.resolve("denied")
}
