'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React, { Fragment, useEffect, useRef } from 'react'

gsap.registerPlugin(ScrollTrigger)

interface BoxRevealProps {
    children: React.ReactNode
    width?: 'fit-content' | '100%'
    boxColor?: string
    duration?: number
    className?: string
}

const BoxReveal = ({
    children,
    width = 'fit-content',
    boxColor,
    duration = 0.5,
    className,
}: BoxRevealProps) => {
    const boxRef = useRef<HTMLDivElement>(null)
    const slideRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const box = boxRef.current
        const slide = slideRef.current

        if (box && slide) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: box,
                    start: 'top center+=100',
                    toggleActions: 'play none none reverse',
                },
            })
                .fromTo(
                    box,
                    { opacity: 0, x: -100 },
                    { opacity: 1, x: 0, duration: duration, delay: 0.25, ease: 'power1.out' }
                )
                .fromTo(
                    slide,
                    { left: 0, duration: 0.1 },
                    { left: '100%', duration: duration, ease: 'easeIn' },
                    '<'
                )
        }
    }, [duration])

    return (
        <div
            style={{ position: 'relative', width, overflow: 'clip' }}
            className={className}
        >
            <div ref={boxRef}>
                <Fragment>{children}</Fragment>
                <div
                    ref={slideRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 20,
                        background: boxColor ?? '#5046e6',
                    }}
                />
            </div>
        </div>
    )
}

export default BoxReveal
