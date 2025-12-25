import { createFileRoute } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";

import { timeAgo } from "../utils.ts";

import { Logo } from "../components/logo.tsx";

export const Route = createFileRoute("/")({
  component: Index,
});

const DOMAIN =
  import.meta.env.MODE === "production"
    ? "https://assets.eoghanmccarthy.com"
    : "https://pub-9045fd240c4d45eebb85c761f7d83dcd.r2.dev";
const BUCKET_NAME = "eoghanmccarthy-com-storage";

function convertToPublicUrl(r2Url: string | undefined) {
  if (!r2Url) {
    return null;
  }

  // Extract the path after the bucket name
  const parts = r2Url.split(`/${BUCKET_NAME}/`);
  if (parts.length < 2) {
    throw new Error("Invalid R2 URL format");
  }

  const path = parts[1];
  return `${DOMAIN}/${path}`;
}

function ProjectCard({ post }: { post: any }) {
  const publicUrl = convertToPublicUrl(post.media_urls[0]);

  return (
    <article className="grid grid-cols-[50px_auto] rounded-2xl overflow-hidden px-8 pt-8 pb-5 gap-y-2 gap-x-8 bg-white text-zinc-900 text-[20px]">
      <picture className="self-end col-start-1 row-span-2 z-[1]">
        <Logo className="w-[50px] h-auto" fill="#fed6e3" />
      </picture>
      <header className="align-baseline justify-between col-start-2 flex-wrap flex gap-2">
        <span className="bg-zinc-600">{post.category || "Random"}</span>
        <time dateTime={post.created_at} className="text-xs">
          {timeAgo(post.created_at)}
        </time>
      </header>
      <div className="col-start-2 gap-2 flex flex-wrap items-center">
        {post.tags}
      </div>
      <section className="col-start-2 gap-3 grid mt-3">
        <p>{post.content}</p>
      </section>
      {publicUrl ? (
        <figure className="grid place-items-center gap-2 my-3 col-span-2 -mx-8">
          <picture>
            <img src={publicUrl} alt={post.content} />
          </picture>
        </figure>
      ) : null}
      <footer className="col-span-2 mt-3 [figure~_&]:mt-0 flex flex-wrap items-center justify-end gap-3">
        share
      </footer>
    </article>
  );
}

function Index() {
  const { data } = useQuery(
    queryOptions({
      queryKey: ["posts"],
      queryFn: async () => {
        const response = await fetch("/api/posts");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      },
    }),
  );

  return (
    <main className="pt-6 px-6">
      <section className="flex flex-col items-center">
        <div className="space-y-8 w-full max-w-192">
          {data?.posts.map((post) => (
            <ProjectCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
