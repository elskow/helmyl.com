import Image from 'next/image'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import { gsap } from 'gsap'

interface ImageProps {
    src: string
    alt: string
}

const Images: React.FC<ImageProps> = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [zoomLevel, setZoomLevel] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })

    const srcSet = src.startsWith('/blog') ? src : `/blog/${src}`
    
    const imageRef = useRef<HTMLDivElement>(null)
    const imageModalRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (isLoaded) {
            gsap.to('.image', {
                filter: 'blur(0px) grayscale(0%) brightness(100%)',
                opacity: 1,
                duration: 1,
                ease: 'easeOut',
            })
        }

        gsap.fromTo(
            imageRef.current,
            { filter: 'blur(10px) grayscale(100%) brightness(50%)', opacity: 0 },
            { filter: 'blur(0px) grayscale(0%) brightness(100%)', opacity: 1, duration: 1, ease: 'easeOut' }
        )

        if (isModalOpen) {
            gsap.fromTo(
                imageModalRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.2, ease: 'easeOut' }
            )
        }
    }, [isLoaded, isModalOpen])

    const handleImageClick = () => setIsModalOpen(true)

    const closeModal = useCallback(() => {
        setIsModalOpen(false)
        setZoomLevel(1)
        setPan({ x: 0, y: 0 })
    }, [])

    const zoomIn = useCallback(() => setZoomLevel((zoomLevel) => zoomLevel * 1.1), [])

    const zoomOut = useCallback(
        () => setZoomLevel((prevZoomLevel) => Math.max(prevZoomLevel / 1.1, 1)),
        []
    )

    const handleClickOutside = useCallback(
        (event) => {
            if (event.target.id === 'modalBackdrop') {
                closeModal()
            }
        },
        [closeModal]
    )

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === '+' || event.key === '=') {
                zoomIn()
            } else if (event.key === '-') {
                zoomOut()
            } else if (event.key === 'Escape') {
                closeModal()
            }
        }

        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'auto'
        }
    }, [isModalOpen, zoomIn, zoomOut, closeModal])

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsDragging(true)
        setStartDragPosition({ x: event.clientX, y: event.clientY })
    }

    const sensitivityFactor = 0.5

    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (isDragging) {
                const dx = (event.clientX - startDragPosition.x) * sensitivityFactor
                const dy = (event.clientY - startDragPosition.y) * sensitivityFactor
                setPan((prevPan) => ({ x: prevPan.x + dx, y: prevPan.y + dy }))
                setStartDragPosition({ x: event.clientX, y: event.clientY })
            }
        },
        [isDragging, startDragPosition, sensitivityFactor]
    )

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        } else {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    const resetZoomAndPan = useCallback(() => {
        setZoomLevel(1);
        setPan({ x: 0, y: 0 });
    }, []);

    const handleWheel = useCallback((event: React.WheelEvent) => {
        event.preventDefault();
        setZoomLevel(zoomLevel => {
            const newZoomLevel = event.deltaY < 0 ? zoomLevel * 1.1 : zoomLevel / 1.1;
            return Math.max(newZoomLevel, 1);
        });
    }, []);

    return (
        <>
            <figure className="flex justify-center">
                <div className="mb:p-5 mb:px-10 relative z-0 w-fit rounded-lg bg-white p-2 dark:bg-slate-900">
                    <div className="flex w-full justify-center">
                            <div
                                ref={imageRef}
                                className="image"
                            >
                                <Image
                                    src={srcSet}
                                    alt={alt}
                                    className="max-h-screen max-w-full rounded-lg object-cover object-center drop-shadow-lg md:max-h-[60vh] lg:max-h-[80vh] lg:rounded-xl px-8 cursor-zoom-in"
                                    onLoad={() => setIsLoaded(true)}
                                    width={800}
                                    height={800}
                                    loading="lazy"
                                    quality={60}
                                    onClick={handleImageClick}
                                />
                            </div>
                    </div>
                    <p className="py-5 text-center text-sm text-gray-500 dark:text-gray-400">
                        {alt}
                    </p>
                </div>
            </figure>
            {isModalOpen && (
                <div
                    id="modalBackdrop"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                    onClick={handleClickOutside}
                    onWheel={handleWheel}
                >
                        <div
                            ref={imageModalRef}
                            className="w-[90vw] h-[90vh] lg:w-[80vh] lg:h-[80vh] flex items-center justify-center relative"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div
                                className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-black bg-opacity-50 rounded-md"
                                onClick={(event) => event.stopPropagation()}
                                style={{ display: 'flex', justifyContent: 'flex-end' }}
                            >
                                <button
                                    onClick={zoomIn}
                                    aria-label="Zoom in"
                                    title="Zoom in"
                                    style={{ fontSize: '24px', padding: '10px' }}
                                >
                                    <FiZoomIn
                                        size={24}
                                        className="text-white dark:text-gray-400 hover:text-emerald-500"
                                    />
                                </button>
                                <button
                                    onClick={zoomOut}
                                    aria-label="Zoom out"
                                    title="Zoom out"
                                    style={{ fontSize: '24px', padding: '10px' }}
                                >
                                    <FiZoomOut
                                        size={24}
                                        className="text-white dark:text-gray-400 hover:text-red-500"
                                    />
                                </button>
                                <button
                                    onClick={closeModal}
                                    aria-label="Close"
                                    title="Close"
                                    style={{ fontSize: '24px', padding: '10px' }}
                                >
                                    <FiX
                                        size={24}
                                        className="text-white dark:text-gray-400 hover:text-rose-500"
                                    />
                                </button>
                            </div>
                            <div
                                onMouseDown={handleMouseDown}
                                onDoubleClick={resetZoomAndPan}
                                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                            >
                                <Image
                                    src={srcSet}
                                    alt={alt}
                                    width={1600 * zoomLevel}
                                    height={1600 * zoomLevel}
                                    quality={100}
                                    loading="lazy"
                                    className="object-contain rounded-lg"
                                    style={{
                                        transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
                                        transition: 'transform',
                                    }}
                                    onClick={(event) => event.stopPropagation()}
                                    draggable={false}
                                />
                            </div>
                        </div>
                </div>
            )}
        </>
    )
}

export default Images
