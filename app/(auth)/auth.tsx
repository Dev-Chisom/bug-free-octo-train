import type React from "react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="py-6 flex justify-center">
        <Link href="/" className="flex items-center space-x-2">
          {/* <img src="/logo.svg" alt="Whispers" className="h-10 w-auto" /> */}
          <span className="text-2xl font-bold text-primary-600">Whispers</span>
        </Link>
      </div>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-lg">{children}</div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-200">
        <p>&copy; {currentYear} Whispers. All rights reserved.</p>
      </footer>
    </div>
  )
}
