import { LazyMotion, domAnimation, m, useAnimation } from 'framer-motion'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi'

const Images = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [zoomLevel, setZoomLevel] = useState(1)
    const controls = useAnimation()

    const srcSet = src.startsWith('/blog') ? src : '/blog/' + src

    useEffect(() => {
        if (isLoaded) {
            controls.start({
                filter: 'blur(0px) grayscale(0%) brightness(100%)',
                opacity: 1,
                transition: { duration: 1, ease: 'easeOut' },
            })
        }
    }, [isLoaded, controls])

    const handleImageClick = () => {
        setIsModalOpen(true)
    }

    const closeModal = useCallback(() => {
        setIsModalOpen(false)
        setZoomLevel(1)
    }, [])

    const zoomIn = useCallback(() => {
        setZoomLevel((zoomLevel) => zoomLevel * 1.1)
    }, [])

    const zoomOut = useCallback(() => {
        setZoomLevel((prevZoomLevel) => Math.max(prevZoomLevel / 1.1, 1))
    }, [])

    const handleClickOutside = useCallback(
        (event) => {
            if (event.target.id === 'modalBackdrop') {
                closeModal()
            }
        },
        [closeModal]
    )

    useEffect(() => {
        const handleKeyDown = (event) => {
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
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isModalOpen, zoomIn, zoomOut, closeModal])

    return (
        <>
            <figure className="flex justify-center">
                <div className="mb:p-5 mb:px-10 relative z-0 w-fit rounded-lg bg-white p-2 dark:bg-slate-900">
                    <div className="flex w-full justify-center">
                        <LazyMotion features={domAnimation}>
                            <m.div
                                animate={controls}
                                initial={{
                                    filter: 'blur(10px) grayscale(100%) brightness(50%)',
                                    opacity: 0,
                                }}
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
                            </m.div>
                        </LazyMotion>
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
                >
                    <LazyMotion features={domAnimation}>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
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
                            <Image
                                src={srcSet}
                                alt={alt}
                                width={1600 * zoomLevel}
                                height={1600 * zoomLevel}
                                quality={100}
                                loading="lazy"
                                className="object-contain rounded-lg"
                                style={{ transform: `scale(${zoomLevel})` }}
                                onClick={(event) => event.stopPropagation()}
                            />
                        </m.div>
                    </LazyMotion>
                </div>
            )}
        </>
    )
}

export default Images
