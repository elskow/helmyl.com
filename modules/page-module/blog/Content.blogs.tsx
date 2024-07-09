import dynamic from 'next/dynamic'

const PostCard = dynamic(() => import('@/components/_blog/PostCard'))

const ContentBlogs = ({ posts }) => {
    return (
        <div className={`space-y-8`}>
            {posts.map((post, index) => (
                <ul key={post.slug} className="mt-4">
                    <PostCard
                        index={index}
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
