import type { NextConfig } from "next";

// Define required environment variables for the build
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    // We only warn here or throw if it's strictly required during build.
    // For local development it might be in .env.local, but Vercel needs them injected.
    console.warn(`[WARNING] Missing expected environment variable: ${envVar}`);
  }
});



const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ],
    }]
  },
};

export default nextConfig;
