'use client'

import ProjectLinkIcon from '@/components/_project/ProjectLinkIcon'
import TechStack from '@/components/_project/TechStackBadge'
import { LazyMotion, domAnimation, m, useAnimation } from 'framer-motion'
import Link from 'next/link'
import React, { useEffect } from 'react'

const ProjectCard = ({ title, description, href, tech, date, ...props }) => {
    const cardVariant = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                delay: 0.2,
                duration: 0.5,
            },
        },
    }

    const controls = useAnimation()

    useEffect(() => {
        controls.start('visible')
    }, [controls])

    return (
        <LazyMotion features={domAnimation}>
            <m.div
                {...props}
                initial="hidden"
                animate={controls}
                variants={cardVariant}
                className="group relative items-start rounded-lg bg-neutral-200 dark:bg-slate-800 border dark:border-gray-700 border-gray-500 max-h-[30rem] w-full mx-auto max-w-[30rem] transition-all duration-300 ease-in-out hover:shadow-lg flex flex-grow flex-col p-6"
            >
                <p
                    className="mt-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                    {date}
                </p>
                <Link
                    href={href}
                    aria-label={`Learn more about ${title}`}
                    className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-50 hover:underline"
                >
                    {title}
                </Link>
                <p
                    className="mt-2 flex-grow text-sm text-zinc-600 dark:text-zinc-300"
                >
                    {description}
                </p>
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
            </m.div>
        </LazyMotion>
    )
}

export default ProjectCard