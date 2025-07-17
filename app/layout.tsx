import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { WhatsAppWebhookHandler } from "@/components/whatsapp-webhook"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Scalinova - Corporate Attendance Portal",
  description: "Professional attendance management system for corporate environments",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <WhatsAppWebhookHandler />
      </body>
    </html>
  )
}
