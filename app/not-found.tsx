'use client'

import { gsap } from 'gsap'
import { Metadata } from 'next'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export const metadata: Metadata = {
    metadataBase: new URL(`https://helmyl.com`),
    title: `404 | Helmy Luqmanulhakim`,
    description: 'Page not found',
    openGraph: {
        title: '404 | Helmy Luqmanulhakim',
        description: 'Page not found',
        url: 'https://helmyl.com',
        locale: 'en_US',
        type: 'website',
    },
}

const NotFound = () => {
    const titleRef = useRef(null)

    useEffect(() => {
        gsap.fromTo(titleRef.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.5 })
    }, [])

    return (
        <div className="flex lg:max-w-5xl mx-auto">
            <div className="flex flex-col items-center justify-center h-full w-full">
                <h1
                    ref={titleRef}
                    className="mb-4 text-3xl font-bold text-neutral-900 dark:text-neutral-100 lg:text-6xl"
                >
                    404
                </h1>
                <p className="mb-4 text-neutral-700 dark:text-neutral-300 lg:text-lg">
                    Page not found
                </p>
                <button className="rounded-md bg-zinc-900 px-4 py-2 text-neutral-100 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-neutral-900 dark:hover:bg-zinc-200 lg:font-medium">
                    <Link href="/" unselectable={'on'} draggable={false}>
                        Back to home
                    </Link>
                </button>
            </div>
        </div>
    )
}

export default NotFound
