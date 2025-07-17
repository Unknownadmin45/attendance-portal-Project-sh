// WhatsApp Message Templates for consistent messaging

export const WhatsAppTemplates = {
  // Welcome message for new employees
  welcome: (employeeName: string) => `🎉 *Welcome to Scalinova, ${employeeName}!*

Your WhatsApp attendance bot is now active.

📱 *Quick Commands:*
• \`checkin\` - Mark your daily attendance
• \`checkout\` - End your work day
• \`status\` - Check your current status
• \`help\` - Show all available commands

💡 *Pro Tip:* You can also apply for leave directly through WhatsApp!

Example: \`leave 2025-07-20 to 2025-07-22 vacation\`

Have a great day at work! 💪`,

  // Daily check-in reminder
  dailyReminder: (employeeName: string) => `🌅 *Good Morning, ${employeeName}!*

⏰ Friendly reminder to mark your attendance for today.

Simply reply with \`checkin\` to mark your attendance.

Have a productive day ahead! 😊`,

  // Check-out reminder
  checkoutReminder: (employeeName: string) => `🌆 *End of Day Reminder*

Hi ${employeeName}! Don't forget to check out for today.

Reply with \`checkout\` to mark your check-out time.

Thanks for your hard work today! 💪`,

  // Leave approval notification
  leaveApproved: (
    employeeName: string,
    fromDate: string,
    toDate: string,
    approver: string,
  ) => `✅ *Leave Request APPROVED*

Hi ${employeeName}!

📅 **Leave Details:**
• From: ${fromDate}
• To: ${toDate}
• Approved by: ${approver}

🎉 Enjoy your time off! Have a great break.

Please ensure proper handover before your leave starts.`,

  // Leave rejection notification
  leaveRejected: (
    employeeName: string,
    fromDate: string,
    toDate: string,
    reason: string,
    approver: string,
  ) => `❌ *Leave Request REJECTED*

Hi ${employeeName},

📅 **Leave Details:**
• From: ${fromDate}
• To: ${toDate}
• Rejected by: ${approver}

📝 **Reason:** ${reason}

Please contact your manager for more details or to discuss alternative dates.`,

  // Weekly attendance summary
  weeklySummary: (
    employeeName: string,
    presentDays: number,
    totalDays: number,
    totalHours: number,
  ) => `📊 *Weekly Attendance Summary*

Hi ${employeeName}!

📅 **This Week's Performance:**
• Days Present: ${presentDays}/${totalDays}
• Total Hours: ${totalHours}
• Attendance Rate: ${Math.round((presentDays / totalDays) * 100)}%

${presentDays === totalDays ? "🎉 Perfect attendance this week!" : "💪 Keep up the good work!"}

Have a great weekend! 🎉`,

  // Admin daily summary
  adminDailySummary: (
    date: string,
    totalEmployees: number,
    present: number,
    absent: number,
    late: number,
  ) => `📊 *Daily Attendance Summary*

📅 **Date:** ${date}

👥 **Overview:**
• Total Employees: ${totalEmployees}
• Present: ${present}
• Absent: ${absent}
• Late Arrivals: ${late}

📈 **Attendance Rate:** ${Math.round((present / totalEmployees) * 100)}%

${present === totalEmployees ? "🎉 100% attendance today!" : "📋 Review absent employees if needed."}`,

  // System maintenance notification
  maintenance: (startTime: string, endTime: string) => `🔧 *System Maintenance Notice*

⚠️ **Scheduled Maintenance**
• Start: ${startTime}
• End: ${endTime}

During this time:
• WhatsApp bot will be temporarily unavailable
• Use the web portal for attendance marking
• Normal service will resume automatically

We apologize for any inconvenience. 🙏`,

  // Holiday notification
  holiday: (holidayName: string, date: string) => `🎉 *Holiday Notification*

📅 **${holidayName}** - ${date}

🏖️ The office will be closed on this day.
No attendance marking required.

Enjoy your holiday! 🎊`,

  // Birthday wishes
  birthday: (employeeName: string) => `🎂 *Happy Birthday, ${employeeName}!* 🎉

Wishing you a wonderful day filled with joy and happiness!

🎁 May this new year of your life bring you success, good health, and lots of memorable moments.

Enjoy your special day! 🥳

- Team Scalinova`,

  // Work anniversary
  workAnniversary: (employeeName: string, years: number) => `🎊 *Work Anniversary Celebration!*

Congratulations ${employeeName}! 🎉

Today marks your ${years} ${years === 1 ? "year" : "years"} with Scalinova!

🏆 Thank you for your dedication, hard work, and valuable contributions to our team.

Here's to many more successful years together! 🥂

- Team Scalinova`,

  // Emergency contact
  emergency: (message: string) => `🚨 *URGENT NOTICE*

${message}

Please respond immediately or contact HR at:
📞 Emergency Hotline: +1-800-SCALINOVA

This is an automated emergency notification.`,

  // Bot error message
  error: () => `❌ *Oops! Something went wrong*

We're experiencing technical difficulties with the attendance bot.

🔧 **What you can do:**
• Try your command again in a few minutes
• Use the web portal: portal.scalinova.com
• Contact IT support if the issue persists

We apologize for the inconvenience and are working to fix this quickly.`,

  // Help menu
  help: () => `🤖 *Scalinova Attendance Bot Help*

📋 **Available Commands:**

✅ \`checkin\` - Mark your daily attendance
❌ \`checkout\` - End your work day
📊 \`status\` - Check your current attendance status
📝 \`leave YYYY-MM-DD to YYYY-MM-DD reason\` - Apply for leave
❓ \`help\` - Show this help menu

📖 **Examples:**
• \`checkin\`
• \`checkout\`
• \`status\`
• \`leave 2025-07-20 to 2025-07-22 family vacation\`

🆘 **Need Help?**
Contact HR: hr@scalinova.com
IT Support: it@scalinova.com

💡 **Tip:** Commands are not case-sensitive!`,
}
