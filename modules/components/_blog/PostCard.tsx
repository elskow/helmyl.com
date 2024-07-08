"use client"

import FormatDate from '@/components/_blog/FormatDate'
import { gsap } from 'gsap'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

const PostCard = ({ href, title, summary, date, readingTime }) => {
    const [ref, inView] = useInView({
        triggerOnce: true, // Trigger animation only once
        threshold: 0.5, // Trigger when 50% of the element is in view
    })

    const cardRef = useRef(null)
    const titleRef = useRef(null)
    const summaryRef = useRef(null)

    useEffect(() => {
        if (inView) {
            gsap.to(cardRef.current, { opacity: 1, y: 0, duration: 0.5 })
            gsap.to(titleRef.current, { opacity: 1, x: 0, duration: 0.5, delay: 0.1 })
            gsap.to(summaryRef.current, { opacity: 1, x: 0, duration: 0.5, delay: 0.2 })
        }
    }, [inView])

    return (
        <div ref={ref} className="flex w-full flex-col md:flex-row">
            <Link
                href={href}
                className="group flex w-full flex-col"
                draggable={false}
                unselectable={'on'}
                prefetch={false}
            >
                <h1
                    ref={titleRef}
                    className="flex cursor-pointer items-center font-newsreader text-lg font-semibold transition-colors duration-300 group-hover:text-slate-900 group-hover:underline dark:group-hover:text-gray-300 lg:text-2xl"
                >
                    {title}
                    <span className="text-gray dark:text-slate ml-3 hidden font-sans text-sm font-light sm:inline-block">
                        ({readingTime})
                    </span>
                </h1>
                <p
                    ref={summaryRef}
                    className="mt-1 hidden text-sm text-primary dark:text-primary md:flex lg:text-base"
                >
                    {summary}
                </p>
            </Link>
            <FormatDate dateString={date} />
            <div ref={cardRef} className="my-4 border-b border-gray-200 dark:border-gray-700" />
        </div>
    )
}

export default PostCard
