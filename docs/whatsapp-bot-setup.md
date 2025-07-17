# WhatsApp Bot Integration Setup Guide

## Overview
The Scalinova Attendance Portal includes a comprehensive WhatsApp bot integration that allows employees to mark attendance, check status, apply for leaves, and receive automated notifications directly through WhatsApp.

## Features

### Employee Commands
- **checkin** - Mark daily attendance
- **checkout** - End work day and calculate hours
- **status** - Check current attendance status
- **leave [from-date] to [to-date] [reason]** - Apply for leave
- **help** - Display available commands

### Automated Notifications
- **Daily Reminders** - Morning check-in reminders (8:30 AM)
- **Checkout Reminders** - End-of-day reminders (5:30 PM)
- **Admin Summaries** - Daily attendance reports to administrators (6:00 PM)
- **Weekly Reports** - Comprehensive weekly attendance reports (Friday 5:00 PM)
- **Leave Notifications** - Instant leave approval/rejection notifications

## Production Setup

### 1. WhatsApp Business API Setup

#### Prerequisites
- WhatsApp Business Account
- Facebook Business Manager Account
- Verified Business Phone Number
- SSL Certificate for webhook URL

#### Steps
1. **Create WhatsApp Business Account**
   \`\`\`bash
   # Visit Facebook Business Manager
   https://business.facebook.com/
   
   # Create new WhatsApp Business Account
   # Verify your business phone number
   \`\`\`

2. **Get API Credentials**
   \`\`\`bash
   # Phone Number ID
   # Access Token
   # App Secret
   # Webhook Verify Token
   \`\`\`

3. **Configure Environment Variables**
   \`\`\`env
   WHATSAPP_ACCESS_TOKEN=your_access_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_APP_SECRET=your_app_secret
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
   WHATSAPP_API_URL=https://graph.facebook.com/v17.0
   \`\`\`

### 2. Webhook Configuration

#### Create Webhook Endpoint
\`\`\`typescript
// pages/api/whatsapp/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { whatsappBot } from '@/lib/whatsapp-bot'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Webhook verification
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge)
    } else {
      res.status(403).send('Forbidden')
    }
  } else if (req.method === 'POST') {
    // Handle incoming messages
    const body = req.body

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        entry.changes?.forEach((change: any) => {
          if (change.field === 'messages') {
            const messages = change.value.messages
            messages?.forEach(async (message: any) => {
              const response = await whatsappBot.processIncomingMessage({
                from: message.from,
                body: message.text?.body || '',
                timestamp: message.timestamp,
                messageId: message.id
              })

              if (response) {
                // Send response back via WhatsApp API
                await sendWhatsAppMessage(response.to, response.message)
              }
            })
          }
        })
      })
    }

    res.status(200).send('OK')
  } else {
    res.status(405).send('Method Not Allowed')
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  const response = await fetch(`${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      text: { body: message }
    })
  })

  return response.json()
}
\`\`\`

#### Configure Webhook URL
\`\`\`bash
# Set webhook URL in Facebook Developer Console
https://your-domain.com/api/whatsapp/webhook

# Verify webhook is working
curl -X GET "https://your-domain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=your_verify_token"
\`\`\`

### 3. Automated Scheduling

#### Using Vercel Cron Jobs
\`\`\`typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/whatsapp/daily-reminders",
      "schedule": "30 8 * * 1-5"
    },
    {
      "path": "/api/whatsapp/checkout-reminders", 
      "schedule": "30 17 * * 1-5"
    },
    {
      "path": "/api/whatsapp/admin-summary",
      "schedule": "0 18 * * 1-5"
    },
    {
      "path": "/api/whatsapp/weekly-report",
      "schedule": "0 17 * * 5"
    }
  ]
}
\`\`\`

#### Cron Job Endpoints
\`\`\`typescript
// pages/api/whatsapp/daily-reminders.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const users = await getUsersFromDatabase()
    const employees = users.filter(user => user.role === 'employee' && user.status === 'active')
    
    await whatsappBot.sendDailyReminder(employees)
    
    res.status(200).json({ message: 'Daily reminders sent', count: employees.length })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
\`\`\`

### 4. Security Considerations

#### Webhook Security
\`\`\`typescript
import crypto from 'crypto'

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  )
}
\`\`\`

#### Rate Limiting
\`\`\`typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
\`\`\`

## Testing

### Local Development
\`\`\`bash
# Use ngrok to expose local webhook
ngrok http 3000

# Update webhook URL in Facebook Developer Console
https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
\`\`\`

### Test Commands
\`\`\`bash
# Test check-in
curl -X POST https://your-domain.com/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"from": "+1234567890", "body": "checkin"}'

# Test status check
curl -X POST https://your-domain.com/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{"from": "+1234567890", "body": "status"}'
\`\`\`

## Monitoring

### Message Logs
\`\`\`typescript
// Log all WhatsApp interactions
const logWhatsAppMessage = async (type: 'incoming' | 'outgoing', data: any) => {
  await database.whatsappLogs.create({
    type,
    from: data.from || data.to,
    message: data.body || data.message,
    timestamp: new Date(),
    status: data.status || 'sent'
  })
}
\`\`\`

### Analytics Dashboard
- Message volume tracking
- Response time monitoring
- Error rate analysis
- User engagement metrics

## Troubleshooting

### Common Issues
1. **Webhook not receiving messages**
   - Check webhook URL is accessible
   - Verify webhook token matches
   - Check SSL certificate is valid

2. **Messages not sending**
   - Verify access token is valid
   - Check phone number is verified
   - Ensure message format is correct

3. **Rate limiting errors**
   - Implement exponential backoff
   - Monitor API usage limits
   - Use message queuing for bulk sends

### Debug Mode
\`\`\`typescript
// Enable debug logging
process.env.WHATSAPP_DEBUG = 'true'

// Log all API calls
const debugLog = (message: string, data?: any) => {
  if (process.env.WHATSAPP_DEBUG === 'true') {
    console.log(`[WhatsApp Debug] ${message}`, data)
  }
}
\`\`\`

## Best Practices

1. **Message Templates**
   - Use approved message templates for notifications
   - Keep messages concise and clear
   - Include relevant emojis for better engagement

2. **Error Handling**
   - Implement retry logic for failed messages
   - Log all errors for debugging
   - Provide fallback communication methods

3. **User Experience**
   - Provide clear command instructions
   - Handle typos and variations gracefully
   - Send confirmation messages for actions

4. **Performance**
   - Use message queuing for bulk operations
