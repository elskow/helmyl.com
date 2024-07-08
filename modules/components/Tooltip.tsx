'use client'

import { useEffect, useRef, useState } from 'react'

const Tooltip = ({ children, tooltipText, position = 'top', className = '', delay = 200 }) => {
    const [visible, setVisible] = useState(false)
    const timeoutId = useRef<number | null>(null)
    const tooltipRef = useRef<HTMLElement>(null)

    const showTooltip = () => {
        timeoutId.current = window.setTimeout(() => {
            setVisible(true)
        }, delay) as unknown as number
    }

    const hideTooltip = () => {
        clearTimeout(timeoutId.current as unknown as number)
        setVisible(false)
    }

    useEffect(() => {
        const handleViewport = () => {
            if (tooltipRef.current) {
                const { top } = tooltipRef.current.getBoundingClientRect()
                if (top < 0) {
                    tooltipRef.current.style.top = '100%'
                    tooltipRef.current.style.bottom = 'auto'
                }
            }
        }

        if (visible) {
            handleViewport()
        }
    }, [visible])

    return (
        <div className="relative inline-block cursor-pointer">
            <button
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                aria-haspopup="true"
                aria-expanded={visible}
                className="focus:outline-none"
            >
                {children}
            </button>
            {visible && (
                <section
                    ref={tooltipRef}
                    role="tooltip"
                    aria-label={tooltipText}
                    className={`absolute left-1/2 mb-2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md text-center z-10 w-fit whitespace-nowrap dark:bg-gray-200 dark:text-gray-800 ${position === 'top' ? 'bottom-full' : 'top-full'} ${className}`}
                    style={{ transitionDelay: `${delay}ms` }}
                >
                    {tooltipText}
                </section>
            )}
        </div>
    )
}

export default Tooltip
