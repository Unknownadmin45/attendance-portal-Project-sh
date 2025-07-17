"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Smartphone, Bell, CheckCircle, AlertCircle } from "lucide-react"
import { whatsappBot } from "@/lib/whatsapp-bot"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WhatsAppIntegrationCardProps {
  userPhone?: string
  isEmployee?: boolean
}

export function WhatsAppIntegrationCard({ userPhone, isEmployee = false }: WhatsAppIntegrationCardProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<string | null>(null)

  // Check if WhatsApp is configured
  const isConfigured = !!(
    process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN && process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID
  )

  useEffect(() => {
    // Check if user has WhatsApp notifications
    const notifications = whatsappBot.getNotifications()
    const userNotifications = notifications.filter((n) => n.to === userPhone)
    setIsConnected(userNotifications.length > 0)

    if (userNotifications.length > 0) {
      setLastMessage(userNotifications[0].timestamp)
    }
  }, [userPhone])

  const handleTestConnection = async () => {
    if (!userPhone) return

    try {
      await whatsappBot["sendMessage"](
        userPhone,
        `🤖 *WhatsApp Bot Connected!*\n\nHi! Your WhatsApp is now connected to Scalinova Attendance Portal.\n\n📱 *Quick Commands:*\n• Send "checkin" to mark attendance\n• Send "checkout" to end your day\n• Send "status" to check your status\n• Send "help" for more commands\n\nWelcome aboard! 🎉`,
      )

      setIsConnected(true)
      setLastMessage(new Date().toISOString())
    } catch (error) {
      console.error("Failed to test WhatsApp connection:", error)
    }
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          WhatsApp Integration
          {isConnected && (
            <Badge variant="default" className="bg-green-600">
              {isConfigured ? "Connected" : "Demo Mode"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isConfigured
            ? "Mark attendance and receive notifications via WhatsApp"
            : "WhatsApp bot demo - Configure API credentials during deployment for real messaging"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Demo Mode:</strong> All features work perfectly for testing. Real WhatsApp messages will be sent
              once API credentials are configured during deployment.
            </AlertDescription>
          </Alert>
        )}

        {isEmployee ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Quick Attendance</p>
                  <p className="text-sm text-gray-600">Send "checkin" or "checkout" to mark attendance</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Bell className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Smart Reminders</p>
                  <p className="text-sm text-gray-600">Get daily reminders and notifications</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Instant Status</p>
                  <p className="text-sm text-gray-600">Check your attendance status anytime</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📱 How to Use:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  1. Save this number: <strong>+1 (555) 123-4567</strong>
                </p>
                <p>2. Send "help" to see all commands</p>
                <p>3. Use "checkin" and "checkout" for attendance</p>
                <p>4. Apply for leave with "leave YYYY-MM-DD to YYYY-MM-DD reason"</p>
              </div>
            </div>

            {!isConnected && (
              <Button onClick={handleTestConnection} className="w-full bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Test WhatsApp Connection
              </Button>
            )}

            {isConnected && lastMessage && (
              <div className="text-center text-sm text-gray-600">
                Last message: {new Date(lastMessage).toLocaleString()}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">WhatsApp Bot is configured and ready for employee use.</p>
            <Button variant="outline" onClick={() => (window.location.href = "#whatsapp")}>
              Manage WhatsApp Bot
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
