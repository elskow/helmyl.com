import { useEffect, useRef } from 'react'
import * as tocbot from 'tocbot'

export default function Toc({ ...props }) {
    const tocRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            const activeLink = tocRef.current?.querySelector('.is-active-link')
            activeLink?.scrollIntoView({
                behavior: 'instant',
                block: 'nearest',
            })
        }

        try {
            tocbot.init({
                tocSelector: '.js-toc',
                contentSelector: '.js-toc-content',
                headingSelector: 'h1, h2, h3, h4, h5, h6',
                scrollSmooth: true,
                orderedList: false,
                hasInnerContainers: true,
            })

            document.addEventListener('scroll', handleScroll)
        } catch (error) {
            console.error('Failed to initialize tocbot:', error)
        }

        return () => {
            tocbot.destroy()
            document.removeEventListener('scroll', handleScroll)
        }
    }, [])

    return (
        <div className="toc-card" {...props}>
            <div className="toc-content">
                <div className="js-toc" ref={tocRef} />
            </div>
        </div>
    )
}
