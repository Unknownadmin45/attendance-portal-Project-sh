"use client"

import { whatsappBot } from "./whatsapp-bot"

// WhatsApp Bot Scheduler for automated notifications
class WhatsAppScheduler {
  private intervals: { [key: string]: NodeJS.Timeout } = {}

  // Start all scheduled tasks
  startScheduler() {
    this.scheduleDailyReminders()
    this.scheduleCheckoutReminders()
    this.scheduleAdminSummary()
    this.scheduleWeeklyReports()
  }

  // Stop all scheduled tasks
  stopScheduler() {
    Object.values(this.intervals).forEach((interval) => {
      clearInterval(interval)
    })
    this.intervals = {}
  }

  // Schedule daily check-in reminders (8:30 AM weekdays)
  private scheduleDailyReminders() {
    const scheduleTime = this.getNextScheduleTime(8, 30) // 8:30 AM

    this.intervals.dailyReminders = setInterval(async () => {
      const now = new Date()
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5 // Monday to Friday

      if (isWeekday && now.getHours() === 8 && now.getMinutes() === 30) {
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const employees = users.filter((user: any) => user.role === "employee" && user.status === "active")

        await whatsappBot.sendDailyReminder(employees)
        console.log("Daily reminders sent to", employees.length, "employees")
      }
    }, 60000) // Check every minute
  }

  // Schedule checkout reminders (5:30 PM weekdays)
  private scheduleCheckoutReminders() {
    this.intervals.checkoutReminders = setInterval(async () => {
      const now = new Date()
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5 // Monday to Friday

      if (isWeekday && now.getHours() === 17 && now.getMinutes() === 30) {
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const employees = users.filter((user: any) => user.role === "employee" && user.status === "active")

        await whatsappBot.sendCheckoutReminder(employees)
        console.log("Checkout reminders sent to active employees")
      }
    }, 60000) // Check every minute
  }

  // Schedule admin daily summary (6:00 PM weekdays)
  private scheduleAdminSummary() {
    this.intervals.adminSummary = setInterval(async () => {
      const now = new Date()
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5 // Monday to Friday

      if (isWeekday && now.getHours() === 18 && now.getMinutes() === 0) {
        await whatsappBot.sendAdminDailySummary()
        console.log("Admin daily summary sent")
      }
    }, 60000) // Check every minute
  }

  // Schedule weekly reports (Friday 5:00 PM)
  private scheduleWeeklyReports() {
    this.intervals.weeklyReports = setInterval(async () => {
      const now = new Date()
      const isFriday = now.getDay() === 5 // Friday

      if (isFriday && now.getHours() === 17 && now.getMinutes() === 0) {
        await this.sendWeeklyReports()
        console.log("Weekly reports sent")
      }
    }, 60000) // Check every minute
  }

  // Send weekly attendance reports
  private async sendWeeklyReports() {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")

    // Get this week's date range
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)) // Monday
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 4)) // Friday

    const startDateStr = startOfWeek.toISOString().split("T")[0]
    const endDateStr = endOfWeek.toISOString().split("T")[0]

    // Send reports to admins
    const admins = users.filter((user: any) => user.role === "admin")
    const employees = users.filter((user: any) => user.role === "employee" && user.status === "active")

    // Calculate weekly stats
    const weeklyAttendance = attendance.filter(
      (record: any) => record.date >= startDateStr && record.date <= endDateStr,
    )

    const totalWorkingDays = 5 // Monday to Friday
    const totalPossibleAttendance = employees.length * totalWorkingDays
    const actualAttendance = weeklyAttendance.length
    const attendanceRate = Math.round((actualAttendance / totalPossibleAttendance) * 100)

    const weeklyReport = `📊 *Weekly Attendance Report*\n📅 ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}\n\n👥 Total Employees: ${employees.length}\n📈 Attendance Rate: ${attendanceRate}%\n✅ Total Check-ins: ${actualAttendance}\n📊 Working Days: ${totalWorkingDays}\n\n📋 Have a great weekend! 🎉`

    for (const admin of admins) {
      await whatsappBot["sendMessage"](admin.phone, weeklyReport)
    }
  }

  // Utility function to get next schedule time
  private getNextScheduleTime(hour: number, minute: number): Date {
    const now = new Date()
    const scheduleTime = new Date()
    scheduleTime.setHours(hour, minute, 0, 0)

    if (scheduleTime <= now) {
      scheduleTime.setDate(scheduleTime.getDate() + 1)
    }

    return scheduleTime
  }

  // Manual trigger functions for testing
  async triggerDailyReminders() {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const employees = users.filter((user: any) => user.role === "employee" && user.status === "active")
    await whatsappBot.sendDailyReminder(employees)
  }

  async triggerCheckoutReminders() {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const employees = users.filter((user: any) => user.role === "employee" && user.status === "active")
    await whatsappBot.sendCheckoutReminder(employees)
  }

  async triggerAdminSummary() {
    await whatsappBot.sendAdminDailySummary()
  }

  async triggerWeeklyReport() {
    await this.sendWeeklyReports()
  }
}

export const whatsappScheduler = new WhatsAppScheduler()

// Auto-start scheduler when module loads (in production, this would be handled by a cron job or server)
if (typeof window !== "undefined") {
  whatsappScheduler.startScheduler()
}
