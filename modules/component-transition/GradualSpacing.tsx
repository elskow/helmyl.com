'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface GradualSpacingProps {
    text: string
    duration?: number
    delayMultiple?: number
    framerProps?: Variants
    className?: string
    children?: ReactNode
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
    children, // Destructure children from props
}: GradualSpacingProps) {
    return (
        <span className="flex" style={{ position: 'relative', overflow: 'clip' }}>
            <AnimatePresence>
                {text.split('').map((char, i) => (
                    <motion.h1
                        key={i}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={framerProps}
                        transition={{ duration, delay: i * delayMultiple }}
                        className={cn('drop-shadow-sm ', className)}
                    >
                        {char === ' ' ? <span>&nbsp;</span> : char}
                    </motion.h1>
                ))}
            </AnimatePresence>
            {children}
        </span>
    )
}
