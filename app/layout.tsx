import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// 👇 THIS BLOCK HAS BEEN UPDATED
export const metadata: Metadata = {
  title: {
    default: 'SplitX', // Your new default title
    template: '%s | SplitX', // Used for other pages like "Login | SplitX"
  },
  description: 'A friendly app to split expenses with friends.', // New description
  icons: {
    icon: '/placeholder-logo.svg', // This uses your logo from the 'public' folder
  },
}
// 👆 END OF UPDATED BLOCK

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}