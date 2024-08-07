import BoxReveal from '@/component-transition/BoxReveal'
import Link from 'next/link'
import { RxChevronDown } from 'react-icons/rx'

const Hero = () => {
    return (
        <section className="my-auto space-y-6 pb-[10vh] items-start">
            <BoxReveal duration={0.2} boxColor="#0f766e">
                <p className="font-medium text-slate-800 dark:text-slate-100 sm:text-xl">
                    Hello! I&apos;m <span className="font-bold">Helmy Luqmanulhakim</span>.
                </p>
            </BoxReveal>
            <BoxReveal duration={0.5} boxColor="#0f766e">
                <h1 className="mb-6 font-code text-3xl font-semibold tracking-extra-tight text-slate-900 dark:text-slate-50 lg:text-5xl">
                    I do software development
                    <br />
                    and data-related stuff.
                </h1>
            </BoxReveal>
            <BoxReveal duration={0.6} boxColor="#0f766e">
                <p className="mb-6 tracking-tight text-slate-800 dark:text-slate-100 sm:text-xl md:max-w-2xl">
                    I&apos;ve been coding for over{' '}
                    <span className="underline underline-offset-4" title="2022 - now">
                        {new Date().getFullYear() - 2022} years
                    </span>
                    , working on projects from data science to web development. I&apos;m highly
                    interested in exploring <b>computational mathematics</b> and{' '}
                    <b>backend engineering</b>.
                </p>
            </BoxReveal>
            <BoxReveal
                className="flex select-none flex-col sm:flex-row space-y-2 sm:space-y-0"
                duration={0.8}
                boxColor="#0f766e"
            >
                <Link
                    className="inline-flex items-center rounded-md font-semibold hover:font-bold hover:underline transition-all duration-300 pr-3"
                    href="/about"
                    draggable={false}
                    unselectable={'on'}
                    prefetch={false}
                >
                    Learn More
                    <RxChevronDown className={`ml-1`} />
                </Link>
                <Link
                    className="mt-2 inline-flex items-center rounded-md font-semibold hover:font-bold hover:underline sm:mt-0 sm:pl-4 transition-all duration-300"
                    href="/projects"
                    draggable={false}
                    unselectable={'on'}
                    title={'Explore my projects'}
                    prefetch={false}
                >
                    Explore My Work
                    <RxChevronDown className={`ml-1`} />
                </Link>
            </BoxReveal>
        </section>
    )
}

export default Hero
