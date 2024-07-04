"use client"

import React, { useEffect, useRef, useMemo } from 'react'
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GradualSpacingProps {
    text: string
    duration?: number
    delayMultiple?: number
    framerProps?: any
    className?: string
    children?: React.ReactNode
}

const CharComponent = React.memo(({ char, index, controls, duration, delayMultiple, framerProps, className }: {
    char: string,
    index: number,
    controls: any,
    duration: number,
    delayMultiple: number,
    framerProps: any,
    className?: string
}) => {
    const transition = useMemo(() => ({
        duration,
        delay: index * delayMultiple,
    }), [index, duration, delayMultiple]);

    return (
        <motion.span
            initial="hidden"
            animate={controls}
            exit="hidden"
            variants={framerProps}
            transition={transition}
            className={cn('drop-shadow-sm ', className)}
        >
            {char === ' ' ? <span>&nbsp;</span> : char}
        </motion.span>
    );
});

CharComponent.displayName = 'CharComponent'

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

    const charComponents = useMemo(() => text.split('').map((char, i) => (
        <CharComponent
            key={`${char}-${i}`}
            char={char}
            index={i}
            controls={controls}
            duration={duration}
            delayMultiple={delayMultiple}
            framerProps={framerProps}
            className={className}
        />
    )), [text, controls, duration, delayMultiple, framerProps, className]);

    return (
        <span ref={ref} className="flex" style={{ position: 'relative', overflow: 'clip' }} suppressHydrationWarning={false}>
            <AnimatePresence>
                {charComponents}
            </AnimatePresence>
            {children}
        </span>
    )
}
