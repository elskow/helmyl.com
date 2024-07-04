'use client'

import FormatDate from '@/components/_blog/FormatDate'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'

const PostCard = ({ href, title, summary, date, readingTime }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0.5 }}
            animate={inView ? { opacity: 1 } : { opacity: 0.5 }}
            transition={{
                duration: 0.3,
            }}
        >
            <div className="flex w-full flex-col md:flex-row">
                <Link
                    href={href}
                    className="group flex w-full flex-col"
                    draggable={false}
                    unselectable={'on'}
                    prefetch={false}
                >
                    <motion.h1 className="flex cursor-pointer items-center font-newsreader text-lg font-semibold transition-colors duration-300 group-hover:text-slate-900 group-hover:underline dark:group-hover:text-gray-300 lg:text-2xl">
                        {title}
                        <span className="text-gray dark:text-slate ml-3 hidden font-sans text-sm font-light sm:inline-block">
                            ({readingTime})
                        </span>
                    </motion.h1>
                    <motion.p className="mt-1 hidden text-sm text-primary dark:text-primary md:flex lg:text-base">
                        {summary}
                    </motion.p>
                </Link>
                <FormatDate dateString={date} />
            </div>
            <motion.div className="my-4 border-b border-gray-200 dark:border-gray-700" />
        </motion.div>
    )
}

export default PostCard