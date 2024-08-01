'use client'

import { domAnimation, LazyMotion, m, useAnimation } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

const ProjectCard = ({ title, description, href, image, tech, date, ...props }) => {
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
                initial="hidden"
                animate={controls}
                variants={cardVariant}
                className="overflow-hidden border-2 border-neutral-500/50 dark:border-neutral-200/10 rounded-sm shadow-sm rounded-t-lg"
            >
                <Link href={href}>
                    <figure className="group relative aspect-video rounded-t-lg overflow-hidden">
                        <Image
                            alt={title}
                            loading="lazy"
                            className="object-cover object-center grayscale-[60%] transition-all duration-500 group-hover:grayscale-0"
                            sizes="100%"
                            src={image || 'https://via.placeholder.com/800x450'}
                            layout="fill"
                        />
                        <div
                            className="absolute inset-0 grid place-items-center bg-gradient-to-t from-yellow-900/20 via-emerald-600/5 via-60% to-neutral-200/20 transition-opacity duration-500 group-hover:opacity-0">
                            <p className="text-center text-base font-semibold px-2 py-1 text-emerald-900 stroke-2 bg-invert">
                                {title}
                            </p>
                        </div>
                    </figure>
                    <div className="p-4">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{date}</p>
                        <p className="line-clamp-3 text-sm mb-2 text-neutral-800 dark:text-neutral-200">
                            {description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 justify-end pb-2">
                            {tech.map((tech) => (
                                <span
                                    key={tech}
                                    className="text-xs px-2 py-1 bg-neutral-100/50 dark:bg-emerald-100/10 rounded-sm"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </Link>
            </m.div>
        </LazyMotion>
    )
}

export default ProjectCard
