import Navbar from '../components/Navbar'
import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Dapp',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='relative bg-slate-800 text-slate-100'>
        <Providers>
          <Navbar />
          <div className="h-16"></div>
          {children}
        </Providers>
      </body>
    </html>
  )
}
