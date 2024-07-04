import Slide from '@/component-transition/Slide'
import ContentProjects from '@/page-module/projects/Content.projects'
import HeaderProjects from '@/page-module/projects/Header.projects'
import project from 'content/project.json'
import { Metadata } from 'next'

const projects = project.projects.sort((a, b) => b.date - a.date)

export const metadata: Metadata = {
    title: 'Projects',
    description: 'A list of all projects I have worked on',
}

const Projects = () => {
    return (
        <section className="mx-auto mb-10 mt-6 min-h-screen w-full justify-center space-y-8 md:mt-10 lg:max-w-5xl">
            <div>
                <HeaderProjects />
            </div>
            <Slide delay={0.5}>
                <ContentProjects projects={projects} />
            </Slide>
        </section>
    )
}

export default Projects
