'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import Skills from 'const/Skills'
import Link from 'next/link'

const Skillset = ({ ...props }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const intervalId = useRef<number | null>(null)
    const [hoveredLogo, setHoveredLogo] = useState<number | null>(null)

    const animateLogo = (index: number, enter: boolean) => {
        const logo = scrollRef.current?.querySelectorAll('.logo-item')[index]
        if (logo) {
            if (enter) {
                gsap.to(logo, { scale: 1.1, color: '#38b2ac', duration: 0.3 })
            } else {
                gsap.to(logo, { scale: 1, color: '', duration: 0.3 })
            }
        }
    }

    const startScroll = () => {
        if (intervalId.current !== null) {
            clearInterval(intervalId.current)
        }
        intervalId.current = window.setInterval(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft += 1
                if (scrollRef.current.scrollLeft >= scrollRef.current.scrollWidth / 2) {
                    scrollRef.current.scrollLeft = 0
                }
            }
        }, 20)
    }

    const stopScroll = () => {
        if (intervalId.current !== null) {
            window.clearInterval(intervalId.current)
            intervalId.current = null
        }
    }

    useEffect(() => {
        startScroll()
        return () => stopScroll()
    }, [])

    const handleMouseEnter = (index: number) => {
        stopScroll()
        setHoveredLogo(index)
        animateLogo(index, true)
    }

    const handleMouseLeave = (index: number) => {
        startScroll()
        setHoveredLogo(null)
        animateLogo(index, false)
    }

    return (
        <div
            ref={scrollRef}
            className="mx-2 inline-flex w-full flex-nowrap overflow-hidden py-8 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]"
            {...props}
        >
            <ul className="flex max-w-none md:justify-start">
                {Skills.concat(Skills).map((logo, index) => (
                    <Link
                        key={`${logo.text}-${index}`}
                        href={logo.link}
                        target="_blank"
                        title={logo.text}
                        rel="noopener noreferrer"
                        draggable={false}
                        unselectable={'on'}
                    >
                        <li
                            className={`logo-item mx-8 ${
                                hoveredLogo === index ? 'cursor-pointer text-teal-500' : ''
                            } ${hoveredLogo !== null && hoveredLogo !== index ? 'opacity-60' : ''}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                        >
                            <logo.Icon className="text-4xl md:text-5xl" />
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    )
}

export default Skillset
