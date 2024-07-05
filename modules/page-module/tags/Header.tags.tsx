import GradualSpacing from '@/component-transition/GradualSpacing'

const HeaderTags = () => {
    return (
        <div className="space-y-3">
            <h1 className="font-newsreader text-4xl font-bold lg:text-5xl">
                <GradualSpacing text="Tags" duration={0.2} />
            </h1>
        </div>
    )
}

export default HeaderTags
