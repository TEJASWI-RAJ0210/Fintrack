import { Plus_Jakarta_Sans, DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-display',
  weight:   ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-body',
  weight:   ['400', '500'],
})

export const metadata = {
  title:       'Fintrack — Personal Finance Dashboard',
  description: 'Privacy-first personal finance tracker. Track expenses, visualize spending, and manage budgets — free forever.',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable}`}
    >
      <body className="font-body bg-bg-base text-text-primary antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}