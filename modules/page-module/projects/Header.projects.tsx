import GradualSpacing from '@/component-transition/GradualSpacing'

const HeaderProjects = () => {
    return (
        <div className="space-y-3 border-b border-gray-200 pb-5 dark:border-gray-700">
            <h1>
                <GradualSpacing
                    text="Projects"
                    className="font-newsreader text-4xl font-bold lg:text-5xl"
                    duration={0.2}
                />
            </h1>
            <p className="lg:text-lg">
                <GradualSpacing text="A list of all my personal projects." duration={0.5} />
            </p>
        </div>
    )
}

export default HeaderProjects
