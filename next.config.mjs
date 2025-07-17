/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_WHATSAPP_API_URL: process.env.NEXT_PUBLIC_WHATSAPP_API_URL,
    NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN: process.env.NEXT_PUBLIC_WHATSAPP_ACCESS_TOKEN,
    NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER_ID,
    NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env.NEXT_PUBLIC_WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    NEXT_PUBLIC_WHATSAPP_APP_SECRET: process.env.NEXT_PUBLIC_WHATSAPP_APP_SECRET,
  },
  async headers() {
    return [
      {
        source: '/api/whatsapp/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Hub-Signature-256',
          },
        ],
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
