import { LazyMotion, domAnimation, m, useAnimation } from 'framer-motion'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import ModalImageBlogMdx from './Modal.ImageBlogMdx'

interface ImageProps {
    src: string
    alt: string
}

const Images: React.FC<ImageProps> = ({ src, alt }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const controls = useAnimation()

    const srcSet = src.startsWith('/blog') ? src : `/blog/${src}`

    useEffect(() => {
        if (isLoaded) {
            controls.start({
                filter: 'blur(0px) grayscale(0%) brightness(100%)',
                opacity: 1,
                transition: { duration: 1, ease: 'easeOut' },
            })
        }
    }, [isLoaded, controls])

    const handleImageClick = () => setIsModalOpen(true)

    const closeModal = useCallback(() => {
        setIsModalOpen(false)
    }, [])

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
                <ModalImageBlogMdx
                    srcSet={srcSet}
                    alt={alt}
                    closeModal={closeModal}
                    isModalOpen={isModalOpen}
                />
            )}
        </>
    )
}

export default Images
