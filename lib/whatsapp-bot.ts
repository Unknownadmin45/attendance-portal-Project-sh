"use client"

// WhatsApp Bot Integration for Attendance Portal
// This simulates WhatsApp Business API integration

interface WhatsAppMessage {
  from: string
  body: string
  timestamp: number
  messageId: string
}

interface WhatsAppResponse {
  to: string
  message: string
  timestamp: number
}

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  department: string
}

class WhatsAppBotService {
  private apiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || "https://graph.facebook.com/v18.0"
  private accessToken = process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN
  private phoneNumberId = process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID
  private webhookVerifyToken = process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN

  // Check if WhatsApp API is configured
  private isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId)
  }

  // Send actual WhatsApp message via Business API
  private async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log("WhatsApp API not configured - storing message locally for demo")
      this.logToLocalStorage("demo", to, message, "demo_sent")
      return true // Return true for demo purposes
    }

    // Clean phone number (remove + and spaces)
    const cleanPhone = to.replace(/[^\d]/g, "")

    try {
      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "text",
          text: {
            body: message,
          },
        }),
      })

      const result = await response.json()

      if (response.ok && result.messages) {
        console.log(`WhatsApp message sent successfully to ${to}:`, result)
        this.logToLocalStorage("outgoing", to, message, "sent", result.messages[0]?.id)
        return true
      } else {
        console.error("WhatsApp API error:", result)
        this.logToLocalStorage("error", to, message, "failed", null, result.error?.message)
        return false
      }
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error)
      this.logToLocalStorage("error", to, message, "failed", null, error.message)
      return false
    }
  }

  // Log messages to localStorage for demo/debugging
  private logToLocalStorage(
    type: "incoming" | "outgoing" | "error" | "demo",
    phone: string,
    message: string,
    status: string,
    messageId?: string,
    errorMessage?: string,
  ) {
    const notifications = JSON.parse(localStorage.getItem("whatsapp_notifications") || "[]")
    notifications.unshift({
      type,
      to: phone,
      from: type === "incoming" ? phone : this.phoneNumberId,
      message,
      timestamp: new Date().toISOString(),
      status,
      messageId,
      errorMessage,
    })

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(100)
    }

    localStorage.setItem("whatsapp_notifications", JSON.stringify(notifications))
  }

  // Verify webhook signature for security
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature || !process.env.NEXT_PUBLIC_WHATSAPP_APP_SECRET) {
      return false
    }

    try {
      const crypto = require("crypto")
      const expectedSignature = crypto
        .createHmac("sha256", process.env.NEXT_PUBLIC_WHATSAPP_APP_SECRET)
        .update(payload)
        .digest("hex")

      return signature === `sha256=${expectedSignature}`
    } catch (error) {
      console.error("Error verifying webhook signature:", error)
      return false
    }
  }

  // Process incoming WhatsApp messages
  async processIncomingMessage(message: WhatsAppMessage): Promise<WhatsAppResponse | null> {
    const { from, body } = message
    const command = body.toLowerCase().trim()

    // Find employee by phone number
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const employee = users.find((user: Employee) => user.phone === from)

    if (!employee) {
      return {
        to: from,
        message: "❌ Phone number not registered. Please contact HR to register your number.",
        timestamp: Date.now(),
      }
    }

    // Process different commands
    switch (true) {
      case command.includes("checkin") || command.includes("check in"):
        return await this.handleCheckIn(employee)

      case command.includes("checkout") || command.includes("check out"):
        return await this.handleCheckOut(employee)

      case command.includes("status"):
        return await this.handleStatusCheck(employee)

      case command.includes("help"):
        return this.getHelpMessage(from)

      case command.includes("leave"):
        return await this.handleLeaveRequest(employee, body)

      default:
        return this.getUnknownCommandMessage(from)
    }
  }

  // Handle check-in command
  private async handleCheckIn(employee: Employee): Promise<WhatsAppResponse> {
    const today = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toLocaleTimeString()

    // Check if already checked in today
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const todayRecord = attendance.find((record: any) => record.userId === employee.id && record.date === today)

    if (todayRecord) {
      return {
        to: employee.phone,
        message: `⚠️ You have already checked in today at ${todayRecord.checkIn}.\n\nUse "checkout" to check out or "status" to see your current status.`,
        timestamp: Date.now(),
      }
    }

    // Create new attendance record
    const newRecord = {
      id: Date.now().toString(),
      userId: employee.id,
      date: today,
      checkIn: currentTime,
      status: "present",
      source: "whatsapp",
    }

    attendance.push(newRecord)
    localStorage.setItem("attendance", JSON.stringify(attendance))

    return {
      to: employee.phone,
      message: `✅ *Check-in Successful!*\n\n👤 ${employee.firstName} ${employee.lastName}\n🕐 Time: ${currentTime}\n📅 Date: ${new Date().toLocaleDateString()}\n🏢 Department: ${employee.department}\n\nHave a productive day! 💪`,
      timestamp: Date.now(),
    }
  }

  // Handle check-out command
  private async handleCheckOut(employee: Employee): Promise<WhatsAppResponse> {
    const today = new Date().toISOString().split("T")[0]
    const currentTime = new Date().toLocaleTimeString()

    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const todayRecordIndex = attendance.findIndex(
      (record: any) => record.userId === employee.id && record.date === today,
    )

    if (todayRecordIndex === -1) {
      return {
        to: employee.phone,
        message: `❌ No check-in record found for today. Please check in first using "checkin".`,
        timestamp: Date.now(),
      }
    }

    const todayRecord = attendance[todayRecordIndex]

    if (todayRecord.checkOut) {
      return {
        to: employee.phone,
        message: `⚠️ You have already checked out today at ${todayRecord.checkOut}.\n\nTotal working hours: ${todayRecord.totalHours || "N/A"} hours`,
        timestamp: Date.now(),
      }
    }

    // Calculate working hours
    const checkInTime = new Date(`${today} ${todayRecord.checkIn}`)
    const checkOutTime = new Date(`${today} ${currentTime}`)
    const totalHours = Math.round(((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)) * 100) / 100

    // Update attendance record
    attendance[todayRecordIndex].checkOut = currentTime
    attendance[todayRecordIndex].totalHours = totalHours
    localStorage.setItem("attendance", JSON.stringify(attendance))

    return {
      to: employee.phone,
      message: `✅ *Check-out Successful!*\n\n👤 ${employee.firstName} ${employee.lastName}\n🕐 Check-out: ${currentTime}\n⏱️ Total Hours: ${totalHours} hours\n📅 Date: ${new Date().toLocaleDateString()}\n\nGreat work today! 🎉`,
      timestamp: Date.now(),
    }
  }

  // Handle status check command
  private async handleStatusCheck(employee: Employee): Promise<WhatsAppResponse> {
    const today = new Date().toISOString().split("T")[0]
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const todayRecord = attendance.find((record: any) => record.userId === employee.id && record.date === today)

    if (!todayRecord) {
      return {
        to: employee.phone,
        message: `📊 *Today's Status*\n\n👤 ${employee.firstName} ${employee.lastName}\n📅 ${new Date().toLocaleDateString()}\n❌ Not checked in yet\n\nUse "checkin" to mark your attendance.`,
        timestamp: Date.now(),
      }
    }

    const statusMessage = todayRecord.checkOut
      ? `✅ Completed for today\n🕐 In: ${todayRecord.checkIn}\n🕐 Out: ${todayRecord.checkOut}\n⏱️ Hours: ${todayRecord.totalHours || "N/A"}`
      : `🟡 Currently checked in\n🕐 In: ${todayRecord.checkIn}\n⏱️ Active since: ${this.getTimeDifference(todayRecord.checkIn)}`

    return {
      to: employee.phone,
      message: `📊 *Today's Status*\n\n👤 ${employee.firstName} ${employee.lastName}\n📅 ${new Date().toLocaleDateString()}\n${statusMessage}`,
      timestamp: Date.now(),
    }
  }

  // Handle leave request command
  private async handleLeaveRequest(employee: Employee, message: string): Promise<WhatsAppResponse> {
    // Extract leave details from message (simplified parsing)
    const leaveMatch = message.match(/leave\s+(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})\s+(.+)/i)

    if (!leaveMatch) {
      return {
        to: employee.phone,
        message: `📝 *Leave Request Format*\n\nTo apply for leave, use:\n"leave YYYY-MM-DD to YYYY-MM-DD reason"\n\nExample:\n"leave 2025-07-20 to 2025-07-22 family vacation"\n\nFor single day:\n"leave 2025-07-20 to 2025-07-20 medical appointment"`,
        timestamp: Date.now(),
      }
    }

    const [, fromDate, toDate, reason] = leaveMatch

    // Create leave request
    const leaves = JSON.parse(localStorage.getItem("leaves") || "[]")
    const newLeave = {
      id: Date.now().toString(),
      userId: employee.id,
      fromDate,
      toDate,
      reason: reason.trim(),
      status: "pending",
      appliedDate: new Date().toISOString(),
      source: "whatsapp",
    }

    leaves.push(newLeave)
    localStorage.setItem("leaves", JSON.stringify(leaves))

    // Calculate leave days
    const startDate = new Date(fromDate)
    const endDate = new Date(toDate)
    const leaveDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    return {
      to: employee.phone,
      message: `📝 *Leave Request Submitted*\n\n👤 ${employee.firstName} ${employee.lastName}\n📅 From: ${new Date(fromDate).toLocaleDateString()}\n📅 To: ${new Date(toDate).toLocaleDateString()}\n📊 Days: ${leaveDays}\n📝 Reason: ${reason}\n⏳ Status: Pending Approval\n\nYour leave request has been forwarded to your manager for approval.`,
      timestamp: Date.now(),
    }
  }

  // Get help message
  private getHelpMessage(phone: string): WhatsAppResponse {
    return {
      to: phone,
      message: `🤖 *Scalinova Attendance Bot*\n\n📋 *Available Commands:*\n\n✅ "checkin" - Mark attendance\n❌ "checkout" - End work day\n📊 "status" - Check today's status\n📝 "leave YYYY-MM-DD to YYYY-MM-DD reason" - Apply for leave\n❓ "help" - Show this menu\n\n*Examples:*\n• checkin\n• checkout\n• status\n• leave 2025-07-20 to 2025-07-22 vacation\n\nNeed help? Contact HR at hr@scalinova.com`,
      timestamp: Date.now(),
    }
  }

  // Get unknown command message
  private getUnknownCommandMessage(phone: string): WhatsAppResponse {
    return {
      to: phone,
      message: `❓ Command not recognized.\n\nType "help" to see available commands.\n\n*Quick Commands:*\n• checkin\n• checkout\n• status\n• help`,
      timestamp: Date.now(),
    }
  }

  // Send daily attendance reminder
  async sendDailyReminder(employees: Employee[]): Promise<void> {
    const today = new Date().toISOString().split("T")[0]
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")

    for (const employee of employees) {
      const todayRecord = attendance.find((record: any) => record.userId === employee.id && record.date === today)

      if (!todayRecord) {
        await this.sendMessage(
          employee.phone,
          `🌅 *Good Morning ${employee.firstName}!*\n\n⏰ Friendly reminder to mark your attendance for today.\n\nSend "checkin" to mark your attendance.\n\nHave a great day! 😊`,
        )
      }
    }
  }

  // Send checkout reminder
  async sendCheckoutReminder(employees: Employee[]): Promise<void> {
    const today = new Date().toISOString().split("T")[0]
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")

    for (const employee of employees) {
      const todayRecord = attendance.find((record: any) => record.userId === employee.id && record.date === today)

      if (todayRecord && !todayRecord.checkOut) {
        await this.sendMessage(
          employee.phone,
          `🌆 *End of Day Reminder*\n\nHi ${employee.firstName}! Don't forget to check out for today.\n\nSend "checkout" to mark your check-out time.\n\nThanks for your hard work today! 💪`,
        )
      }
    }
  }

  // Send admin daily summary
  async sendAdminDailySummary(): Promise<void> {
    const today = new Date().toISOString().split("T")[0]
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")

    const admins = users.filter((user: any) => user.role === "admin")
    const employees = users.filter((user: any) => user.role === "employee")
    const todayAttendance = attendance.filter((record: any) => record.date === today)

    const presentCount = todayAttendance.length
    const absentCount = employees.length - presentCount
    const lateCount = todayAttendance.filter((record: any) => {
      const checkInTime = new Date(`${today} ${record.checkIn}`)
      const nineAM = new Date(`${today} 09:00:00`)
      return checkInTime > nineAM
    }).length

    const summary = `📊 *Daily Attendance Summary*\n📅 ${new Date().toLocaleDateString()}\n\n👥 Total Employees: ${employees.length}\n✅ Present: ${presentCount}\n❌ Absent: ${absentCount}\n⏰ Late Arrivals: ${lateCount}\n\n📈 Attendance Rate: ${Math.round((presentCount / employees.length) * 100)}%`

    for (const admin of admins) {
      await this.sendMessage(admin.phone, summary)
    }
  }

  // Send leave approval notification
  async sendLeaveApprovalNotification(
    leaveId: string,
    status: "approved" | "rejected",
    comments?: string,
  ): Promise<void> {
    const leaves = JSON.parse(localStorage.getItem("leaves") || "[]")
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    const leave = leaves.find((l: any) => l.id === leaveId)
    if (!leave) return

    const employee = users.find((u: any) => u.id === leave.userId)
    if (!employee) return

    const statusEmoji = status === "approved" ? "✅" : "❌"
    const statusText = status === "approved" ? "APPROVED" : "REJECTED"

    let message = `${statusEmoji} *Leave Request ${statusText}*\n\n📅 From: ${new Date(leave.fromDate).toLocaleDateString()}\n📅 To: ${new Date(leave.toDate).toLocaleDateString()}\n📝 Reason: ${leave.reason}\n⏳ Status: ${statusText}`

    if (comments) {
      message += `\n💬 Comments: ${comments}`
    }

    if (status === "approved") {
      message += `\n\n🎉 Enjoy your time off!`
    } else {
      message += `\n\n📞 Please contact your manager for more details.`
    }

    await this.sendMessage(employee.phone, message)
  }

  // Utility function to calculate time difference
  private getTimeDifference(timeString: string): string {
    const now = new Date()
    const checkInTime = new Date(`${now.toDateString()} ${timeString}`)
    const diffMs = now.getTime() - checkInTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }

  // Get WhatsApp notifications for demo
  getNotifications(): any[] {
    return JSON.parse(localStorage.getItem("whatsapp_notifications") || "[]")
  }

  // Clear notifications
  clearNotifications(): void {
    localStorage.removeItem("whatsapp_notifications")
  }

  // Get configuration status
  getConfigurationStatus() {
    return {
      isConfigured: this.isConfigured(),
      hasAccessToken: !!this.accessToken,
      hasPhoneNumberId: !!this.phoneNumberId,
      hasWebhookToken: !!this.webhookVerifyToken,
      apiUrl: this.apiUrl,
    }
  }
}

export const whatsappBot = new WhatsAppBotService()
