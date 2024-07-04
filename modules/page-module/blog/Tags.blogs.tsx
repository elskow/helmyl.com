'use client'

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { slug } from 'github-slugger'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const TagsBlogs = ({ tags }) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    useEffect(() => {
        setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }, [])

    const variants = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: prefersReducedMotion
                ? {}
                : {
                      delay: i * 0.05,
                      type: 'linear',
                  },
        }),
        moreVisible: {
            opacity: 1,
            transition: prefersReducedMotion
                ? {}
                : {
                      delay: 0.2,
                      type: 'linear',
                  },
        },
    }

    return (
        <AnimatePresence>
            <div
                ref={ref}
                className="mb-4 flex select-none flex-wrap border-b border-gray-200 pb-5 dark:border-gray-700"
                style={{ position: 'relative', overflow: 'clip' }}
            >
                {isInView &&
                    tags.slice(0, 2).map((tag, index) => (
                        <motion.ul
                            key={tag}
                            custom={index}
                            variants={variants}
                            initial="hidden"
                            animate="visible"
                            className="mb-2 mr-2 rounded bg-gray-200 px-2 py-1 text-sm text-gray-700 transition hover:bg-gray-300 hover:bg-opacity-80 dark:bg-gray-700 dark:text-gray-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-80 border border-gray-300 dark:border-gray-700 capitalize"
                        >
                            <Link
                                className="px-2"
                                href={`/tags/${slug(tag)}`}
                                draggable={false}
                                unselectable={'on'}
                            >
                                {slug(tag)}
                            </Link>
                        </motion.ul>
                    ))}
                {isInView && tags.length > 2 && (
                    <motion.ul
                        variants={variants}
                        initial="hidden"
                        animate="moreVisible"
                        className="mb-2 mr-2 rounded bg-green-900 px-1 py-1 text-xs font-medium capitalize text-green-50 transition-all duration-300  dark:bg-gray-300 dark:text-gray-900"
                    >
                        <Link href="/tags" draggable={false} unselectable={'on'}>
                            +{tags.length - 2} more
                        </Link>
                    </motion.ul>
                )}
            </div>
        </AnimatePresence>
    )
}

export default TagsBlogs
