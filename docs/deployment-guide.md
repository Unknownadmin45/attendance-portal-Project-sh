# WhatsApp Integration Deployment Guide

## Overview
The Scalinova Attendance Portal includes a comprehensive WhatsApp bot that works in two modes:
- **Demo Mode**: Full functionality with local message logging (current state)
- **Production Mode**: Real WhatsApp message sending via Business API

## Current Status: Demo Mode ✅

The system is currently running in **Demo Mode** which means:
- ✅ All WhatsApp bot features work perfectly
- ✅ Employee commands are processed correctly
- ✅ Automated notifications are scheduled
- ✅ Admin dashboard shows all functionality
- 📝 Messages are logged locally instead of sent via WhatsApp

## Production Deployment Setup

### Step 1: WhatsApp Business API Setup

#### Prerequisites
- WhatsApp Business Account
- Facebook Business Manager Account
- Verified Business Phone Number
- SSL Certificate for webhook URL

#### Get API Credentials
1. **Create WhatsApp Business Account**
   - Visit [Facebook Business Manager](https://business.facebook.com/)
   - Create new WhatsApp Business Account
   - Verify your business phone number

2. **Get Required Credentials**
   - Phone Number ID
   - Access Token (with required permissions)
   - App Secret
   - Webhook Verify Token (create your own)

### Step 2: Environment Variables Configuration

Add these environment variables to your deployment platform:

\`\`\`bash
# Required for WhatsApp API
NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN=your_access_token_here
NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token
NEXT_PUBLIC_WHATSAPP_APP_SECRET=your_app_secret_here

# Optional (defaults provided)
NEXT_PUBLIC_WHATSAPP_API_URL=https://graph.facebook.com/v18.0
\`\`\`

### Step 3: Webhook Configuration

#### Webhook URL
\`\`\`
https://your-domain.com/api/whatsapp/webhook
\`\`\`

#### Required Webhook Events
- `messages` - To receive incoming messages
- `message_deliveries` - To track message delivery status

#### Setup Steps
1. Go to Facebook Developer Console
2. Select your WhatsApp Business App
3. Navigate to WhatsApp → Configuration
4. Add webhook URL: `https://your-domain.com/api/whatsapp/webhook`
5. Enter your verify token
6. Subscribe to `messages` events
7. Save and verify webhook

### Step 4: Testing Production Setup

1. **Deploy with Environment Variables**
   \`\`\`bash
   # Vercel
   vercel env add NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN
   vercel env add NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID
   # ... add other variables
   
   # Netlify
   netlify env:set NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN your_token
   # ... add other variables
   \`\`\`

2. **Test Integration**
   - Go to Admin Dashboard → WhatsApp Bot → Settings
   - Follow the setup wizard
   - Send test message to real phone number
   - Verify message delivery

3. **Verify Webhook**
   - Send a WhatsApp message to your business number
   - Check admin dashboard for incoming message processing
   - Verify bot responses are sent

## Platform-Specific Deployment

### Vercel Deployment
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN
vercel env add NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID
vercel env add NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN
vercel env add NEXT_PUBLIC_WHATSAPP_APP_SECRET

# Redeploy with new variables
vercel --prod
\`\`\`

### Netlify Deployment
\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Add environment variables
netlify env:set NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN your_token
netlify env:set NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID your_phone_id
netlify env:set NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN your_verify_token
netlify env:set NEXT_PUBLIC_WHATSAPP_APP_SECRET your_app_secret
\`\`\`

### Railway Deployment
\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy

# Add environment variables via Railway dashboard
# Or use CLI:
railway variables set NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN=your_token
\`\`\`

## Security Considerations

### Environment Variables Security
- Never commit API credentials to version control
- Use platform-specific environment variable management
- Rotate tokens regularly
- Monitor API usage for unusual activity

### Webhook Security
- Webhook signature verification is implemented
- HTTPS required for webhook URL
- Rate limiting in place
- Input validation for all incoming messages

## Monitoring & Maintenance

### Health Checks
- API connectivity monitoring
- Message delivery rate tracking
- Error rate monitoring
- Webhook uptime monitoring

### Logging
- All messages logged with timestamps
- Error tracking and alerting
- Performance metrics
- User interaction analytics

## Troubleshooting

### Common Issues

1. **Messages not sending**
   - Check API credentials are correct
   - Verify phone number format (include country code)
   - Check API rate limits
   - Verify webhook is receiving responses

2. **Webhook not receiving messages**
   - Verify webhook URL is accessible
   - Check webhook verify token matches
   - Ensure HTTPS is enabled
   - Check Facebook webhook logs

3. **Demo mode still active**
   - Verify all environment variables are set
   - Check variable names match exactly
   - Redeploy after adding variables
   - Check deployment platform logs

### Debug Mode
Enable debug logging by setting:
\`\`\`bash
WHATSAPP_DEBUG=true
\`\`\`

## Support

For deployment assistance:
- Check deployment platform documentation
- Review webhook configuration in Facebook Developer Console
- Test API credentials using the built-in setup wizard
- Monitor application logs for detailed error messages

---

**Note**: The system works perfectly in demo mode for development and testing. Production WhatsApp integration is optional and can be added anytime without affecting existing functionality.
