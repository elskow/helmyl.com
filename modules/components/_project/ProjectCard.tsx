'use client'

import ProjectLinkIcon from '@/components/_project/ProjectLinkIcon'
import TechStack from '@/components/_project/TechStackBadge'
import { LazyMotion, domAnimation, m, useAnimation, useInView } from 'framer-motion'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'

const ProjectCard = ({ title, description, href, tech, date, ...props }) => {
    const textVariant = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: {
                delay: i * 0.2,
                duration: 0.5,
            },
        }),
    }

    const controls = useAnimation()
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        if (isInView) {
            controls.start('visible')
        } else {
            controls.start('hidden')
        }
    }, [isInView, controls])

    return (
        <LazyMotion features={domAnimation}>
            <div
                {...props}
                ref={ref}
                className="group relative items-start rounded-lg bg-neutral-200 dark:bg-slate-800 border dark:border-gray-700 border-gray-500 max-h-[30rem] w-full mx-auto max-w-[30rem] transition-all duration-300 ease-in-out hover:shadow-lg flex flex-grow flex-col p-6"
            >
                <m.p
                    custom={1}
                    initial="hidden"
                    animate={controls}
                    variants={textVariant}
                    className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                    {date}
                </m.p>
                <Link
                    href={href}
                    aria-label={`Learn more about ${title}`}
                    className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-50 hover:underline"
                >
                    <m.a custom={2} initial="hidden" animate={controls} variants={textVariant}>
                        {title}
                    </m.a>
                </Link>
                <m.p
                    custom={3}
                    initial="hidden"
                    animate={controls}
                    variants={textVariant}
                    className="mt-2 flex-grow text-sm text-zinc-600 dark:text-zinc-300"
                >
                    {description}
                </m.p>
                <div className="hidden md:flex mt-4 space-x-2">
                    {tech && <TechStack tech={tech} />}
                </div>
                <Link
                    href={href}
                    aria-label="Project link"
                    className="mt-6 flex items-center text-sm font-medium text-zinc-800 dark:text-zinc-50 hover:text-zinc-600"
                >
                    <ProjectLinkIcon />
                </Link>
            </div>
        </LazyMotion>
    )
}

export default ProjectCard