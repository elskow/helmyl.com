'use client'

import { gsap } from 'gsap'
import React, { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface GradualSpacingProps extends React.PropsWithChildren<{}> {
    text: string
    duration?: number
    delayMultiple?: number
    className?: string
}

const GradualSpacing: React.FC<GradualSpacingProps> = ({
    text,
    duration = 0.5,
    delayMultiple = 0.001,
    className,
}) => {
    const containerRef = useRef<HTMLSpanElement>(null)
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

    useEffect(() => {
        if (inView && containerRef.current) {
            const chars = containerRef.current.children
            gsap.from(chars, {
                opacity: 0,
                x: -20,
                filter: 'blur(1px)',
                delay: (i) => i * delayMultiple,
                duration: duration,
                stagger: 0.01,
                ease: 'power2.inOut',
                onUpdate: function () {
                    const progress = this.progress()
                    const blurAmount = 4 * (1 - progress)
                    this.targets().forEach((target) => {
                        target.style.filter = `blur(${blurAmount}px)`
                    })
                },
                onComplete: function () {
                    this.targets().forEach((target) => {
                        target.style.filter = ''
                    })
                },
            })
        }
    }, [inView, duration, delayMultiple])

    const chars = text.split('').map((char, index) => (
        <span key={index} style={{ display: 'inline-block' }}>
            {char === ' ' ? '\u00A0' : char}
        </span>
    ))

    return (
        <span ref={ref} className={`gradual-spacing-container ${className}`}>
            <span ref={containerRef} className="gradual-spacing-text">
                {chars}
            </span>
        </span>
    )
}

export default GradualSpacing
