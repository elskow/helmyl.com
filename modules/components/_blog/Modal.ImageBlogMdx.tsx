import { LazyMotion, domAnimation, m } from 'framer-motion'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi'
import { MdRefresh } from 'react-icons/md'

const ModalImageBlogMdx = ({ srcSet, alt, closeModal, isModalOpen }) => {
    const [zoomLevel, setZoomLevel] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [touchPoints, setTouchPoints] = useState([])
    const [initialDistance, setInitialDistance] = useState<number | null>(null)
    const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })

    const zoomIn = useCallback(() => setZoomLevel((zoomLevel) => Math.min(zoomLevel * 1.1, 10)), [])
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
            switch (event.key) {
                case '+':
                case '=':
                    zoomIn()
                    break
                case '-':
                    zoomOut()
                    break
                case 'Escape':
                    closeModal()
                    break
                case 'ArrowRight':
                    setPan((prevPan) => ({ x: prevPan.x + 10, y: prevPan.y }))
                    break
                case 'ArrowLeft':
                    setPan((prevPan) => ({ x: prevPan.x - 10, y: prevPan.y }))
                    break
                case 'ArrowUp':
                    setPan((prevPan) => ({ x: prevPan.x, y: prevPan.y - 10 }))
                    break
                case 'ArrowDown':
                    setPan((prevPan) => ({ x: prevPan.x, y: prevPan.y + 10 }))
                    break
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
                let dx = (event.clientX - startDragPosition.x) * sensitivityFactor
                let dy = (event.clientY - startDragPosition.y) * sensitivityFactor
                dx = Math.max(Math.min(dx, 100), -100)
                dy = Math.max(Math.min(dy, 100), -100)
                setPan((prevPan) => ({ x: prevPan.x + dx, y: prevPan.y + dy }))
                setStartDragPosition({ x: event.clientX, y: event.clientY })
            }
        },
        [isDragging, startDragPosition, sensitivityFactor]
    )

    const handleTouchMove = useCallback(
        (event: React.TouchEvent<HTMLDivElement>) => {
            if (event.touches.length === 2 && initialDistance !== null) {
                const point1 = { x: event.touches[0].pageX, y: event.touches[0].pageY }
                const point2 = { x: event.touches[1].pageX, y: event.touches[1].pageY }
                const distance = Math.sqrt(
                    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
                )

                if (distance > initialDistance) {
                    zoomIn()
                } else {
                    zoomOut()
                }
            }
        },
        [initialDistance, zoomIn, zoomOut]
    )

    const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
        if (event.touches.length === 2) {
            const point1 = { x: event.touches[0].pageX, y: event.touches[0].pageY }
            const point2 = { x: event.touches[1].pageX, y: event.touches[1].pageY }
            const distance = Math.sqrt(
                Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
            )
            setInitialDistance(distance)
        }
    }, [])

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
        setZoomLevel(1)
        setPan({ x: 0, y: 0 })
    }, [])

    const handleWheel = useCallback((event: React.WheelEvent) => {
        event.preventDefault()
        setZoomLevel((zoomLevel) => {
            const newZoomLevel =
                event.deltaY < 0 ? Math.min(zoomLevel * 1.1, 10) : Math.max(zoomLevel / 1.1, 1)
            return newZoomLevel
        })
    }, [])

    return (
        <div
            id="modalBackdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            onClick={handleClickOutside}
            onWheel={handleWheel}
            role="dialog"
            aria-modal="true"
            aria-label="Image modal"
            aria-hidden="true"
        >
            <LazyMotion features={domAnimation}>
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-[90vw] h-[90vh] lg:w-[90vh] lg:h-[90vh] flex items-center justify-center relative"
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
                            onClick={resetZoomAndPan}
                            aria-label="Reset zoom and pan"
                            title="Reset"
                            style={{ fontSize: '24px', padding: '10px' }}
                        >
                            <MdRefresh
                                size={24}
                                className="text-white dark:text-gray-400 hover:text-blue-500"
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
                        onTouchMove={handleTouchMove}
                        onTouchStart={handleTouchStart}
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
                </m.div>
            </LazyMotion>
        </div>
    )
}

export default ModalImageBlogMdx
