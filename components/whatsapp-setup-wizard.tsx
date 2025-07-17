"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Copy, Phone } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function WhatsAppSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [testPhone, setTestPhone] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  // Check configuration status
  const configStatus = {
    hasAccessToken: !!process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN,
    hasPhoneNumberId: !!process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID,
    hasWebhookToken: !!process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    isConfigured: !!(process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN && process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID),
  }

  const steps = [
    { id: 1, title: "API Configuration", description: "Set up WhatsApp Business API credentials" },
    { id: 2, title: "Webhook Setup", description: "Configure webhook for incoming messages" },
    { id: 3, title: "Test Connection", description: "Verify your WhatsApp integration" },
    { id: 4, title: "Go Live", description: "Activate bot for employees" },
  ]

  const handleTestConnection = async () => {
    if (!testPhone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phone number to test",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("testing")

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
        setConnectionStatus("success")
        toast({
          title: "Connection Successful! 🎉",
          description: `Test message sent to ${testPhone}. Check your WhatsApp!`,
        })
        setTimeout(() => setCurrentStep(4), 2000)
      } else {
        setConnectionStatus("error")
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to WhatsApp API",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection Error",
        description: "Failed to test connection. Check your configuration.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : ""

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Configuration Status Alert */}
      {!configStatus.isConfigured && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>WhatsApp API Not Configured</strong> - The system is running in demo mode. Configure your WhatsApp
            Business API credentials during deployment to enable real message sending.
          </AlertDescription>
        </Alert>
      )}
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Integration Setup</CardTitle>
          <CardDescription>Follow these steps to set up WhatsApp bot for your attendance portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h3 className="font-semibold">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Tabs value={currentStep.toString()} className="space-y-6">
        <TabsContent value="1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: WhatsApp Business API Configuration</CardTitle>
              <CardDescription>
                {configStatus.isConfigured
                  ? "Your WhatsApp API is configured and ready to use"
                  : "Configure these credentials during deployment to enable WhatsApp integration"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!configStatus.isConfigured && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Deployment Instructions:</strong> Add these environment variables to your production
                    deployment:
                    <br />• NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN
                    <br />• NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID
                    <br />• NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Environment Variables Status</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={configStatus.hasAccessToken ? "••••••••••••••••" : "Not configured"}
                          disabled
                          className="bg-gray-50"
                        />
                        <Badge variant={configStatus.hasAccessToken ? "default" : "secondary"}>
                          {configStatus.hasAccessToken ? "Set" : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={configStatus.hasPhoneNumberId ? "••••••••••••••••" : "Not configured"}
                          disabled
                          className="bg-gray-50"
                        />
                        <Badge variant={configStatus.hasPhoneNumberId ? "default" : "secondary"}>
                          {configStatus.hasPhoneNumberId ? "Set" : "Pending"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label>NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={configStatus.hasWebhookToken ? "••••••••••••••••" : "Not configured"}
                          disabled
                          className="bg-gray-50"
                        />
                        <Badge variant={configStatus.hasWebhookToken ? "default" : "secondary"}>
                          {configStatus.hasWebhookToken ? "Set" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Deployment Setup Guide</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <h5 className="font-medium text-sm">When Ready to Deploy:</h5>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>Create WhatsApp Business Account</li>
                      <li>Set up WhatsApp Business API</li>
                      <li>Get Phone Number ID and Access Token</li>
                      <li>Add environment variables to deployment</li>
                      <li>Configure webhook URL</li>
                      <li>Test the integration</li>
                    </ol>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Demo Mode:</strong> The system works fully without WhatsApp API. Messages are logged
                      locally for testing purposes.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)}>
                  {configStatus.isConfigured ? "Next: Webhook Setup" : "Continue Setup (Demo Mode)"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Webhook Configuration</CardTitle>
              <CardDescription>Set up webhook to receive incoming WhatsApp messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Webhook URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={webhookUrl} disabled className="bg-gray-50" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhookUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Use this URL in your WhatsApp Business API webhook configuration
                  </p>
                </div>

                <div>
                  <Label>Verify Token</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN || "scalinova_webhook_2025"}
                      disabled
                      className="bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN || "scalinova_webhook_2025",
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Webhook Events:</strong> Make sure to subscribe to 'messages' events in your WhatsApp Business
                  API configuration.
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Configuration Steps:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to Facebook Developer Console</li>
                  <li>Select your WhatsApp Business App</li>
                  <li>Navigate to WhatsApp → Configuration</li>
                  <li>Add the webhook URL above</li>
                  <li>Enter the verify token</li>
                  <li>Subscribe to 'messages' events</li>
                  <li>Save and verify the webhook</li>
                </ol>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back: API Configuration
                </Button>
                <Button onClick={() => setCurrentStep(3)}>Next: Test Connection</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Test WhatsApp Connection</CardTitle>
              <CardDescription>Send a test message to verify your integration is working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testPhone">Test Phone Number</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <Input
                      id="testPhone"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter a WhatsApp number to receive the test message (include country code)
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure the phone number is registered with WhatsApp and can receive messages from business
                    accounts.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-center">
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !testPhone.trim()}
                    size="lg"
                    className={`${
                      connectionStatus === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : connectionStatus === "error"
                          ? "bg-red-600 hover:bg-red-700"
                          : ""
                    }`}
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testing Connection...
                      </>
                    ) : connectionStatus === "success" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Connection Successful!
                      </>
                    ) : connectionStatus === "error" ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Test Failed - Try Again
                      </>
                    ) : (
                      "Send Test Message"
                    )}
                  </Button>
                </div>

                {connectionStatus === "success" && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Success!</strong> Test message sent successfully. Check your WhatsApp for the message.
                      Your WhatsApp bot is now ready to use!
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus === "error" && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Connection Failed!</strong> Please check your API credentials and try again. Make sure the
                      phone number is correct and can receive WhatsApp messages.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back: Webhook Setup
                </Button>
                <Button onClick={() => setCurrentStep(4)} disabled={connectionStatus !== "success"}>
                  Next: Go Live
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="4" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 4: WhatsApp Bot is Ready! 🎉</CardTitle>
              <CardDescription>Your WhatsApp integration is now active and ready for employees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Congratulations!</strong> Your WhatsApp bot is now live and ready to handle employee
                  attendance.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Employee Instructions</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                      <strong>1.</strong> Save company WhatsApp number
                    </p>
                    <p className="text-sm">
                      <strong>2.</strong> Send "help" to see all commands
                    </p>
                    <p className="text-sm">
                      <strong>3.</strong> Use "checkin" and "checkout" daily
                    </p>
                    <p className="text-sm">
                      <strong>4.</strong> Apply for leave with proper format
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Available Commands</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">checkin</code>
                      <span className="text-sm text-gray-600">Mark attendance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">checkout</code>
                      <span className="text-sm text-gray-600">End work day</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">status</code>
                      <span className="text-sm text-gray-600">Check status</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">leave [dates] [reason]</code>
                      <span className="text-sm text-gray-600">Apply for leave</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Inform employees about the new WhatsApp bot</li>
                  <li>Share the company WhatsApp number</li>
                  <li>Monitor bot usage in the admin dashboard</li>
                  <li>Set up automated daily reminders</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Button size="lg" onClick={() => window.location.reload()}>
                  Start Using WhatsApp Bot
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
