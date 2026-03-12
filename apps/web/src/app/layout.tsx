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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#0f1520] text-white min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
