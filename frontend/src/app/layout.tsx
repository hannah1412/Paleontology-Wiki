import type { Metadata } from 'next'
import Header from "@/components/UI/Header/Header"
import ThemeProvider from '@/components/UI/ThemeProvider'
import AccessibilityProvider from '@/components/UI/AccessibilityProvider'

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import { Inter } from 'next/font/google'
import '@/global.css'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: "%s | DinoWiki",
    default: "DinoWiki",
    absolute: "DinoWiki"
  },
  description: 'One-stop shop for all your dino needs.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  }
}

export default function RootLayout({ children,}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <ThemeProvider className={inter.className}>
        <AccessibilityProvider>
          <Header/>
          {children}
        </AccessibilityProvider>
      </ThemeProvider>
    </html>
  )
}
