'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ReactNode } from 'react'
import { LuCopy, LuCopyCheck } from 'react-icons/lu'

const Pre = ({ children, className }: { children: ReactNode; className?: string }) => {
    const textInput = useRef<HTMLDivElement>(null)
    const [hovered, setHovered] = useState(false)
    const [copied, setCopied] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const onEnter = () => {
        setHovered(true)
        gsap.to(buttonRef.current, { scale: 1.1, duration: 0.2 })
    }

    const onExit = () => {
        setHovered(false)
        setCopied(false)
        gsap.to(buttonRef.current, { scale: 1, duration: 0.2 })
    }

    const onCopy = () => {
        setCopied(true)
        if (textInput.current) {
            navigator.clipboard.writeText(textInput.current.textContent || '')
        }
        gsap.fromTo(
            buttonRef.current,
            { rotation: 0 },
            { rotation: 10, repeat: 5, yoyo: true, duration: 0.1 }
        )
        setTimeout(() => {
            setCopied(false)
        }, 2000)
    }

    return (
        <div ref={textInput} onMouseEnter={onEnter} onMouseLeave={onExit} className="relative z-0">
            {hovered && (
                <button
                    ref={buttonRef}
                    aria-label="Copy code"
                    className={`absolute right-3 top-3 z-10 rounded-xl bg-slate-800 p-1 text-slate-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 ${
                        copied
                            ? 'border-green-400 focus:border-green-400'
                            : 'border-slate-300'
                    }`}
                    onClick={onCopy}
                >
                    {copied ? (
                        <LuCopyCheck size={18} className="text-green-400" />
                    ) : (
                        <LuCopy size={18} />
                    )}
                </button>
            )}

            <pre className={className}>{children}</pre>
        </div>
    )
}

export default Pre
