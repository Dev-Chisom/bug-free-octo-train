import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"
import { AuthProvider } from "@/lib/auth/auth-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Whispers - Content Creator Platform",
  description: "Premium content creator platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          {/* AuthProvider initializes auth state globally */}
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  )
}
