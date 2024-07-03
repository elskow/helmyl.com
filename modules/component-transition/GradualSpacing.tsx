"use client"

import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface GradualSpacingProps {
    text: string
    duration?: number
    delayMultiple?: number
    framerProps?: any
    className?: string
    children?: React.ReactNode
}

export function GradualSpacing({
    text,
    duration = 0.5,
    delayMultiple = 0.01,
    framerProps = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    },
    className,
    children,
}: GradualSpacingProps) {
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
        <span ref={ref} className="flex" style={{ position: 'relative', overflow: 'clip' }} suppressHydrationWarning={false}>
            <AnimatePresence>
                {text.split('').map((char, i) => (
                    <motion.span
                        key={i}
                        initial="hidden"
                        animate={controls}
                        exit="hidden"
                        variants={framerProps}
                        transition={{ duration, delay: i * delayMultiple }}
                        className={cn('drop-shadow-sm ', className)}
                    >
                        {char === ' ' ? <span>&nbsp;</span> : char}
                    </motion.span>
                ))}
            </AnimatePresence>
            {children}
        </span>
    )
}