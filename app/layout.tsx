import 'styles/globals.css'
import 'styles/prism.css'

import { assistant, jetBrainsMono, newsreader } from '@/lib/fonts'
import { Providers } from './providers'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'
import Script from 'next/script'

const { UMAMI_DATA_WEBSITE_ID } = process.env

export const metadata: Metadata = {
    metadataBase: new URL(`https://helmyl.com`),
    title: {
        default: 'Helmy Luqmanulhakim',
        template: `%s | Helmy Luqmanulhakim`,
    },
    description: 'A personal website.',
    openGraph: {
        title: 'Helmy Luqmanulhakim',
        description: 'A personal website.',
        url: 'https://helmyl.com',
        locale: 'en_US',
        type: 'website',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            className={`${assistant.variable} ${newsreader.variable} ${jetBrainsMono.variable} font-sans font-medium`}
            lang={`en`}
        >
            <Favicon />
            <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml" />
            <Script
                src={`https://us.umami.is/script.js`}
                data-website-id={UMAMI_DATA_WEBSITE_ID}
                async
            />
            <body suppressHydrationWarning={true}>
                {/*<FakeTechnologies />*/}
                <Providers>
                    <div className="min-h-screen bg-neutral-200 px-4 sm:px-8 lg:py-2 justify-between flex flex-col dark:bg-slate-800">
                        <Navbar
                            className={`mx-auto flex select-none items-center justify-between py-4 pt-6 md:pt-8 lg:max-w-5xl lg:pt-14`}
                        />
                        {children}
                        <Footer className="mx-auto pb-6 pt-6 lg:max-w-5xl lg:pb-12 lg:pt-14" />
                    </div>
                </Providers>
            </body>
        </html>
    )
}

const Favicon = () => {
    return (
        <>
            <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png" />
            <link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png" />
            <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png" />
            <link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-icon-76x76.png" />
            <link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-icon-114x114.png" />
            <link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-icon-120x120.png" />
            <link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-icon-144x144.png" />
            <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-icon-152x152.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-icon-180x180.png" />
            <link
                rel="icon"
                type="image/png"
                sizes="192x192"
                href="/favicons/android-icon-192x192.png"
            />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="96x96" href="/favicons/favicon-96x96.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
            <link rel="manifest" href="/favicons/manifest.json" />
            <meta name="msapplication-TileColor" content="#ffffff" />
            <meta name="msapplication-TileImage" content="/favicons/ms-icon-144x144.png" />
            <meta name="theme-color" content="#ffffff" />
        </>
    )
}
