import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Royal Maharaja Mango | Premium Indian Mangoes – GTA Delivery',
  description: 'Premium Kesar & Alphonso mangoes delivered fresh to your door across GTA. Farm-direct from India. Friday & Saturday delivery.',
  openGraph: {
    title: 'Royal Maharaja Mango',
    description: 'Premium Kesar & Alphonso mangoes – fresh from Indian orchards to your door across GTA.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Lato, sans-serif',
              background: '#1b4332',
              color: '#fdf8ee',
              border: '1px solid #d4801a',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
