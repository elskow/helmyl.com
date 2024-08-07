import ContentTags from '@/page-module/tags/Content.tags'
import HeaderTags from '@/page-module/tags/Header.tags'
import NotFoundTags from '@/page-module/tags/NotFound.tags'

import Slide from '@/component-transition/Slide'
import { allPosts } from 'contentlayer/generated'

const posts = allPosts.filter((post) => !post.draft)
const TagsPage = () => {
    const tags = posts
        .map((post) => post.tags)
        .flat()
        .filter((value, index, self) => self.indexOf(value) === index)

    if (posts.length === 0) {
        return <NotFoundTags />
    }

    return (
        <section className="mx-auto mb-10 mt-6 min-h-screen w-full justify-center space-y-8 md:mt-10 lg:max-w-5xl">
            <div>
                <HeaderTags />
            </div>
            <Slide delay={0.1}>
                <ContentTags tags={tags} />
            </Slide>
        </section>
    )
}

export default TagsPage
