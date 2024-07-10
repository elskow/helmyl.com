'use client'

import { motion, useMotionValue } from 'framer-motion'
import React, { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

interface GradualSpacingProps extends React.PropsWithChildren<{}> {
    text: string
    duration?: number
    delayMultiple?: number
    className?: string
    tag?: keyof React.ReactHTML
}

interface CharComponentProps extends React.HTMLAttributes<HTMLSpanElement> {
    char: string
    index: number
    duration: number
    delayMultiple: number
    className?: string
    isVisible: boolean
    tag?: keyof React.ReactHTML
}

const CharComponent: React.FC<CharComponentProps> = React.memo(
    ({ char, index, duration, delayMultiple, className, isVisible, tag = 'span' }) => {
        const opacity = useMotionValue(0)

        useEffect(() => {
            let animationFrameId: number

            const animate = () => {
                const delay = index * delayMultiple
                if (isVisible) {
                    const startTime = performance.now() + delay * 1000
                    const animateOpacity = (time: number) => {
                        const elapsedTime = time - startTime
                        if (elapsedTime > 0) {
                            const progress = elapsedTime / (duration * 1000)
                            opacity.set(Math.min(progress, 1))
                            if (progress < 1) {
                                animationFrameId = requestAnimationFrame(animateOpacity)
                            }
                        } else {
                            animationFrameId = requestAnimationFrame(animateOpacity)
                        }
                    }
                    animationFrameId = requestAnimationFrame(animateOpacity)
                } else {
                    opacity.set(0)
                }
            }

            animate()

            return () => {
                cancelAnimationFrame(animationFrameId)
            }
        }, [isVisible, index, delayMultiple, opacity, duration])

        const content = char === ' ' ? '\u00A0' : char

        return React.createElement(
            motion[tag],
            {
                style: { opacity },
                className,
                transition: {
                    duration: duration,
                    ease: 'easeIn',
                },
            },
            content
        )
    }
)

CharComponent.displayName = 'CharComponent'

const GradualSpacing: React.FC<GradualSpacingProps> = ({
    text,
    duration = 0.3,
    delayMultiple = 0.005,
    className,
    children,
    tag = 'span',
}) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

    const charComponents = text
        .split('')
        .map((char, i) => (
            <CharComponent
                key={`${char}-${i}`}
                char={char}
                index={i}
                duration={duration}
                delayMultiple={delayMultiple}
                className={className}
                isVisible={inView}
                tag={tag}
            />
        ))

    return (
        <span
            ref={ref}
            className={`inline-flex flex-wrap ${className}`}
            style={{
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none',
                MozUserSelect: 'none',
            }}
        >
            {charComponents}
            {children}
        </span>
    )
}

export default GradualSpacing
