'use client'

import { gsap } from 'gsap'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { BiSolidSun } from 'react-icons/bi'
import { FaRegMoon } from 'react-icons/fa'

const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme()
    const [icon, setIcon] = useState(() =>
        theme === 'dark' ? (
            <BiSolidSun className="theme-icon" />
        ) : (
            <FaRegMoon className="theme-icon" />
        )
    )
    const buttonRef = useRef(null)

    useEffect(() => {
        if (theme === 'dark') {
            setIcon(<BiSolidSun className="theme-icon" />)
        } else {
            setIcon(<FaRegMoon className="theme-icon" />)
        }

        gsap.to(buttonRef.current, {
            opacity: 1,
            scale: 1.05,
            rotation: 180,
            duration: 0.1,
            ease: 'elastic.out(1, 0.75)',
            yoyo: true,
            repeat: 1, 
            onComplete: () => {
                gsap.to(buttonRef.current, {
                    scale: 1,
                    rotation: 0,
                    duration: 0.5,                     
                    ease: 'elastic.in(1, 0.75)',
                })
            },
        })
    }, [theme])

    return (
        <button
            ref={buttonRef}
            aria-label="theme toggle button"
            className="rounded-full bg-neutral-200 p-2 transition-all duration-300 ease-in-out hover:bg-neutral-300 hover:focus:outline-none hover:focus:ring-2 hover:focus:ring-slate-500 hover:focus:ring-opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:focus:ring-slate-400 dark:hover:focus:ring-opacity-50 bg-opacity-40"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {icon}
        </button>
    )
}
export default ThemeSwitcher
