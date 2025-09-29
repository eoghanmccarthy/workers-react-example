import type { Request as WorkerRequest } from "@cloudflare/workers-types/experimental";

interface MediaPost {
  id: number;
  content: string;
  category?: string;
  tags?: string[];
  has_media: boolean;
  media_urls?: string[];
  media_types?: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Check requests for a pre-shared secret
const hasValidHeader = (request: WorkerRequest, env: Env) => {
  const headerValue = request.headers.get("X-Custom-Auth-Key");
  const expectedValue = env.AUTH_KEY_SECRET;
  return headerValue === expectedValue;
};

function authorizeRequest(request: WorkerRequest, env: Env) {
  switch (request.method) {
    case "PUT":
    case "DELETE":
      return hasValidHeader(request, env);
    case "GET":
      return true;
    default:
      return false;
  }
}

export default {
  // @ts-expect-error TODO: Fix type error
  async fetch(request: WorkerRequest, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for dev
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Custom-Auth-Key",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (url.pathname.startsWith("/api/")) {
      // Check if the request is authorized
      if (!authorizeRequest(request, env)) {
        return new Response("Forbidden", { status: 403 });
      }

      // GET /api/posts - Fetch paginated media feed
      if (url.pathname === "/api/posts" && request.method === "GET") {
        console.log("Fetching posts from database");
        try {
          const { results } = await env.DB.prepare(
            `SELECT * FROM posts ORDER BY created_at DESC`,
          ).all();

          console.log("Fetched posts:", results);

          // Parse JSON fields from strings
          const posts = results.map((post) => ({
            ...post,
            // tags: post.tags ? JSON.parse(post.tags) : [],
            // media_urls: post.media_urls ? JSON.parse(post.media_urls) : [],
            // media_types: post.media_types ? JSON.parse(post.media_types) : [],
          }));

          return Response.json({ posts }, { headers: corsHeaders });
        } catch (error) {
          console.error("Error fetching posts:", error);
          return Response.json(
            { error: "Failed to fetch posts" },
            {
              status: 500,
              headers: corsHeaders,
            },
          );
        }
      }

      // POST /api/upload - Get signed upload URL for R2 (dev only)
      if (url.pathname === "/api/upload" && request.method === "PUT") {
        // Uploading is only allowed in development
        // if (env.ENVIRONMENT !== "development") {
        //   console.log("Unauthorized upload attempt");
        //   return Response.json(
        //     { error: "Unauthorized" },
        //     {
        //       status: 403,
        //       headers: corsHeaders,
        //     },
        //   );
        // }

        try {
          const formData = await request.formData();
          const file = formData.get("file") as File;
          const filename = formData.get("filename") as string;
          const contentType = formData.get("contentType") as string;

          if (!file) {
            return new Response("No file provided", { status: 400 });
          }

          const fileKey = `${Date.now()}-${crypto.randomUUID()}-${filename}`;
          await env.STORAGE.put(fileKey, file.stream(), {
            httpMetadata: {
              contentType: contentType,
            },
          });

          // Generate public URL through the worker (not direct R2 access)
          const publicUrl = `${new URL(request.url).origin}/media/${fileKey}`;
          return Response.json({
            fileKey,
            publicUrl,
            message: `Object ${fileKey} uploaded successfully!`,
          });
        } catch (error) {
          return Response.json(
            { error: "Failed to upload object" },
            {
              status: 500,
              headers: corsHeaders,
            },
          );
        }
      }

      // POST /api/posts - Create new post (dev only)
      // if (url.pathname === "/api/posts" && request.method === "POST") {
      //   if (env.ENVIRONMENT !== "development") {
      //     return Response.json(
      //       { error: "Unauthorized" },
      //       {
      //         status: 403,
      //         headers: corsHeaders,
      //       },
      //     );
      //   }
      //
      //   try {
      //     const post: Partial<MediaPost> = await request.json();
      //     const id = crypto.randomUUID();
      //     const now = Date.now();
      //
      //     const tagsJson = JSON.stringify(post.tags || []);
      //
      //     await env.DB.prepare(
      //       `
      //       INSERT INTO posts (
      //         id, type, title, description, tags, media_url, thumbnail_url,
      //         created_at, updated_at, file_size, mime_type, width, height
      //       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      //     `,
      //     )
      //       .bind(
      //         id,
      //         post.type,
      //         post.title,
      //         post.description,
      //         tagsJson,
      //         post.media_url,
      //         post.thumbnail_url,
      //         now,
      //         now,
      //         post.file_size,
      //         post.mime_type,
      //         post.width,
      //         post.height,
      //       )
      //       .run();
      //
      //     return Response.json(
      //       {
      //         id,
      //         ...post,
      //         tags: post.tags || [],
      //         created_at: now,
      //         updated_at: now,
      //       },
      //       { headers: corsHeaders },
      //     );
      //   } catch (error) {
      //     return Response.json(
      //       { error: "Failed to create post" },
      //       {
      //         status: 500,
      //         headers: corsHeaders,
      //       },
      //     );
      //   }
      // }

      // Fallback API response
      return Response.json(
        { error: "API endpoint not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
