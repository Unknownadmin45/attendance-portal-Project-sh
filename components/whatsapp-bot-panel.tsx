"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Bell, Users, Trash2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { whatsappBot } from "@/lib/whatsapp-bot"
import { WhatsAppSetupWizard } from "./whatsapp-setup-wizard"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WhatsAppNotification {
  to: string
  message: string
  timestamp: string
  status: string
}

export function WhatsAppBotPanel() {
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([])
  const [testMessage, setTestMessage] = useState("")
  const [testPhone, setTestPhone] = useState("+1234567891")
  const [simulatedMessage, setSimulatedMessage] = useState("checkin")
  const [simulatedPhone, setSimulatedPhone] = useState("+1234567891")

  // Check if WhatsApp is configured
  const isConfigured = !!(
    process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN && process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID
  )

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    const notifs = whatsappBot.getNotifications()
    setNotifications(notifs.reverse()) // Show latest first
  }

  const handleSendTestMessage = async () => {
    if (!testMessage.trim() || !testPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter both phone number and message",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: testPhone,
          message: testMessage,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Message Sent Successfully",
          description: `WhatsApp message sent to ${testPhone}`,
        })
        setTestMessage("")
        loadNotifications()
      } else {
        toast({
          title: "Failed to Send Message",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Check your internet connection.",
        variant: "destructive",
      })
    }
  }

  const handleTestConnection = async () => {
    if (!testPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/whatsapp/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: testPhone,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: `Test message sent to ${testPhone}. Check WhatsApp!`,
        })
        loadNotifications()
      } else {
        toast({
          title: "Connection Test Failed",
          description: result.error || "Failed to connect to WhatsApp API",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to test connection. Check your configuration.",
        variant: "destructive",
      })
    }
  }

  const handleSimulateIncoming = async () => {
    if (!simulatedMessage.trim() || !simulatedPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter both phone number and message",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await whatsappBot.processIncomingMessage({
        from: simulatedPhone,
        body: simulatedMessage,
        timestamp: Date.now(),
        messageId: Date.now().toString(),
      })

      if (response) {
        toast({
          title: "Message Processed",
          description: "Incoming message processed and response sent",
        })
        loadNotifications()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process message",
        variant: "destructive",
      })
    }
  }

  const handleSendDailyReminders = async () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const employees = users.filter((user: any) => user.role === "employee")

    await whatsappBot.sendDailyReminder(employees)
    toast({
      title: "Reminders Sent",
      description: `Daily reminders sent to ${employees.length} employees`,
    })
    loadNotifications()
  }

  const handleSendCheckoutReminders = async () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const employees = users.filter((user: any) => user.role === "employee")

    await whatsappBot.sendCheckoutReminder(employees)
    toast({
      title: "Checkout Reminders Sent",
      description: `Checkout reminders sent to active employees`,
    })
    loadNotifications()
  }

  const handleSendAdminSummary = async () => {
    await whatsappBot.sendAdminDailySummary()
    toast({
      title: "Admin Summary Sent",
      description: "Daily summary sent to administrators",
    })
    loadNotifications()
  }

  const clearNotifications = () => {
    whatsappBot.clearNotifications()
    setNotifications([])
    toast({
      title: "Notifications Cleared",
      description: "All WhatsApp notifications have been cleared",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            WhatsApp Bot Management
            {!isConfigured && <Badge variant="secondary">Demo Mode</Badge>}
          </CardTitle>
          <CardDescription>
            {isConfigured
              ? "Manage WhatsApp bot integration for attendance and notifications"
              : "WhatsApp bot is running in demo mode. Configure API credentials during deployment for real messaging."}
          </CardDescription>
        </CardHeader>
      </Card>

      {!isConfigured && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Mode Active:</strong> All WhatsApp functionality works perfectly for testing. Messages are
            logged locally instead of being sent via WhatsApp API. Configure your WhatsApp Business API credentials
            during deployment to enable real message sending.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="test">Test Messages</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>WhatsApp messages sent and received</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearNotifications}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No notifications yet. Send a test message or simulate incoming messages.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{notification.to}</Badge>
                            <Badge variant={notification.status === "sent" ? "default" : "secondary"}>
                              {notification.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <pre className="text-sm whitespace-pre-wrap">{notification.message}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Test Message</CardTitle>
                <CardDescription>Send a test WhatsApp message to any number</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testPhone">Phone Number</Label>
                  <Input
                    id="testPhone"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testMessage">Message</Label>
                  <Textarea
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Enter your test message..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSendTestMessage} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Message
                </Button>
                <Button onClick={handleTestConnection} variant="outline" className="w-full bg-transparent">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulate Incoming Message</CardTitle>
                <CardDescription>Test bot responses to employee commands</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="simulatedPhone">Employee Phone</Label>
                  <Input
                    id="simulatedPhone"
                    value={simulatedPhone}
                    onChange={(e) => setSimulatedPhone(e.target.value)}
                    placeholder="+1234567891"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="simulatedMessage">Command</Label>
                  <Input
                    id="simulatedMessage"
                    value={simulatedMessage}
                    onChange={(e) => setSimulatedMessage(e.target.value)}
                    placeholder="checkin, checkout, status, help"
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Available commands:</strong>
                  </p>
                  <p>• checkin - Mark attendance</p>
                  <p>• checkout - End work day</p>
                  <p>• status - Check today's status</p>
                  <p>• leave 2025-07-20 to 2025-07-22 vacation</p>
                  <p>• help - Show help menu</p>
                </div>
                <Button onClick={handleSimulateIncoming} className="w-full bg-transparent" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Simulate Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Notifications</CardTitle>
              <CardDescription>Send bulk notifications and reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleSendDailyReminders}
                  className="h-24 flex flex-col items-center justify-center bg-transparent"
                  variant="outline"
                >
                  <Bell className="h-6 w-6 mb-2 text-blue-600" />
                  <span>Send Daily Reminders</span>
                  <span className="text-xs text-gray-500">Morning check-in reminders</span>
                </Button>

                <Button
                  onClick={handleSendCheckoutReminders}
                  className="h-24 flex flex-col items-center justify-center bg-transparent"
                  variant="outline"
                >
                  <Bell className="h-6 w-6 mb-2 text-orange-600" />
                  <span>Checkout Reminders</span>
                  <span className="text-xs text-gray-500">End of day reminders</span>
                </Button>

                <Button
                  onClick={handleSendAdminSummary}
                  className="h-24 flex flex-col items-center justify-center bg-transparent"
                  variant="outline"
                >
                  <Users className="h-6 w-6 mb-2 text-green-600" />
                  <span>Admin Summary</span>
                  <span className="text-xs text-gray-500">Daily attendance report</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automation Schedule</CardTitle>
              <CardDescription>Configure when automated messages are sent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Daily Check-in Reminders</h4>
                    <p className="text-sm text-gray-600">Sent every weekday at 8:30 AM</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Check-out Reminders</h4>
                    <p className="text-sm text-gray-600">Sent every weekday at 5:30 PM</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Admin Daily Summary</h4>
                    <p className="text-sm text-gray-600">Sent every weekday at 6:00 PM</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-gray-600">Sent every Friday at 5:00 PM</p>
                  </div>
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <WhatsAppSetupWizard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
