import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"

export const metadata: Metadata = {
  title: "Codewords — Codenames Online",
  description: "Play Codenames online with friends",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Server component — process.env is read at REQUEST TIME (Railway runtime vars always available)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Inject Supabase config before the React bundle so client.ts gets values synchronously */}
        {supabaseUrl && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__CW_SUPA_URL__=${JSON.stringify(supabaseUrl)};window.__CW_SUPA_KEY__=${JSON.stringify(supabaseAnonKey)};`
            }}
          />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Russo+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#1e1610] text-white min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
