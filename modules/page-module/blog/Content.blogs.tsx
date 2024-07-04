import dynamic from 'next/dynamic'

const PostCard = dynamic(() => import('@/components/_blog/PostCard'))

const ContentBlogs = ({ posts }) => {
    return (
        <div className={`space-y-8`}>
            {posts.map((post) => (
                <ul key={post.slug} className="mt-4">
                    <PostCard
                        readingTime={post.readingTime.text}
                        href={`${post.url}`}
                        title={post.title}
                        summary={post.summary}
                        date={post.date}
                    />
                </ul>
            ))}
        </div>
    )
}

export default ContentBlogs
