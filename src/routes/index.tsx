import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Index,
})

const projects = [
    {
        description: "A digital camera interface that reimagines the viewfinder experience",
        tags: ["camera", "ui", "photography"],
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60"
    },
    {
        description: "A collection of carefully crafted gradients inspired by Japanese aesthetics",
        tags: ["design", "colors", "ui"],
        image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60"
    },
    {
        description: "Digital black and white film simulation for iOS devices",
        tags: ["ios", "photography", "app"],
        image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&auto=format&fit=crop&q=60"
    },
    {
        description: "A minimalist camera interface focusing on the essential",
        tags: ["camera", "minimal", "design"],
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60"
    }
]

function ProjectCard({ description, tags, image }: { description: string; tags: string[]; image: string }) {
    return (
        <div className="grid grid-cols-1 gap-3 items-center">
            <div className="relative bg-zinc-900 rounded-sm border border-zinc-800">
                <img
                    src={image}
                    alt={description}
                    className="w-full object-cover rounded-sm"
                />
            </div>
            <div className="">
                <p className="text-xs mb-2">{description}</p>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <span key={index} className="text-xs text-zinc-500">#{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function Index() {
    return (
        <main className="pt-6 px-6">
            {/* <section className="mb-18">
                <h1 className="text-base font-medium mb-6">Reductionist Design Studio</h1>
            </section> */}
            <section className='flex flex-col items-center'>
                <div className="space-y-8 w-full max-w-192">
                    {projects.map((project, index) => (
                        <ProjectCard
                            key={index}
                            description={project.description}
                            tags={project.tags}
                            image={project.image}
                        />
                    ))}
                </div>
            </section>
        </main>
    )
}
