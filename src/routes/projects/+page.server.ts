import {allProjects} from 'content-collections';

export async function load() {
    return {
        projects: allProjects
            .sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            })
    };
}