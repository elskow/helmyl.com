import GradualSpacing from '@/component-transition/GradualSpacing'
import Link from 'next/link'
import { HiMiniRss } from 'react-icons/hi2'

const HeaderBlogs = () => {
    return (
        <div className="space-y-3">
            <h1 className="font-newsreader text-4xl font-bold lg:text-5xl">
                <GradualSpacing text="Blog" duration={0.2}>
                    <Link
                        href={`/rss.xml`}
                        className="text-base align-top ml-2 text-lime-800 hover:text-lime-500 hover:drop-shadow-lg dark:text-lime-100 dark:hover:text-lime-600 transition-all duration-300"
                    >
                        <HiMiniRss className={`inline`} />
                    </Link>
                </GradualSpacing>
            </h1>
            <p className="lg:text-lg">
                <GradualSpacing
                    text="I write about software development, productivity, and other topics that interest me."
                    duration={0.2}
                />
            </p>
        </div>
    )
}

export default HeaderBlogs
