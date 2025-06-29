import type { Request as WorkerRequest } from "@cloudflare/workers-types/experimental";

interface MediaPost {
  id: string;
  type: "image" | "video" | "audio";
  title?: string;
  description?: string;
  tags?: string[];
  media_url: string;
  thumbnail_url?: string;
  created_at: number;
  updated_at: number;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
}

// Check requests for a pre-shared secret
const hasValidHeader = (request: WorkerRequest, env: Env) => {
  return request.headers.get("X-Custom-Auth-Key") === env.AUTH_KEY_SECRET;
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
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // const object = await env.STORAGE.get(
    //   "1751166552947-9c62cc46-5848-4654-9c0a-27bb81ee9e29-item-121.jpg",
    // );
    // console.log("Storage access successful", object);

    // API Routes
    if (url.pathname.startsWith("/api/")) {
      // Check if the request is authorized
      if (!authorizeRequest(request, env)) {
        return new Response("Forbidden", { status: 403 });
      }

      // GET /api/posts - Fetch paginated media feed
      // if (url.pathname === "/api/posts" && request.method === "GET") {
      //   const limit = parseInt(url.searchParams.get("limit") || "20");
      //   const offset = parseInt(url.searchParams.get("offset") || "0");
      //
      //   try {
      //     const { results } = await env.DB.prepare(
      //       "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
      //     )
      //       .bind(limit, offset)
      //       .all();
      //
      //     // Parse tags from JSON string
      //     const posts = results.map((post) => ({
      //       ...post,
      //       tags: post.tags ? JSON.parse(post.tags) : [],
      //     }));
      //
      //     return Response.json(
      //       {
      //         posts,
      //         hasMore: results.length === limit,
      //       },
      //       { headers: corsHeaders },
      //     );
      //   } catch (error) {
      //     return Response.json(
      //       { error: "Failed to fetch posts" },
      //       {
      //         status: 500,
      //         headers: corsHeaders,
      //       },
      //     );
      //   }
      // }

      // POST /api/upload - Get signed upload URL for R2 (dev only)
      if (url.pathname === "/api/upload" && request.method === "PUT") {
        console.log("Upload request received");
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

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const filename = formData.get("filename") as string;
        const contentType = formData.get("contentType") as string;

        if (!file) {
          return new Response("No file provided", { status: 400 });
        }

        const fileKey = `${Date.now()}-${crypto.randomUUID()}-${filename}`;
        console.log("File key generated:", fileKey);

        const res = await env.STORAGE.put(fileKey, file.stream(), {
          httpMetadata: {
            contentType: contentType,
          },
        });
        console.log("File uploaded to R2:", res);

        // Generate public URL through the worker (not direct R2 access)
        const publicUrl = `${new URL(request.url).origin}/media/${fileKey}`;

        return Response.json({
          fileKey,
          publicUrl,
          message: `Object ${fileKey} uploaded successfully!`,
        });

        // try {
        //   const { filename, contentType } = await request.json();
        //   const fileKey = `${Date.now()}-${crypto.randomUUID()}-${filename}`;
        //
        //   // Generate signed URL for direct upload to R2
        //   const uploadUrl = await env.STORAGE.put(fileKey, request.body);
        //
        //   // Generate public URL through the worker (not direct R2 access)
        //   const publicUrl = `${new URL(request.url).origin}/media/${fileKey}`;
        //
        //   return Response.json(
        //     {
        //       uploadUrl,
        //       fileKey,
        //       publicUrl,
        //     },
        //     { headers: corsHeaders },
        //   );
        // } catch (error) {
        //   return Response.json(
        //     { error: "Failed to generate upload URL" },
        //     {
        //       status: 500,
        //       headers: corsHeaders,
        //     },
        //   );
        // }
      }

      // POST /api/posts - Create new post (dev only)
      if (url.pathname === "/api/posts" && request.method === "POST") {
        if (env.ENVIRONMENT !== "development") {
          return Response.json(
            { error: "Unauthorized" },
            {
              status: 403,
              headers: corsHeaders,
            },
          );
        }

        try {
          const post: Partial<MediaPost> = await request.json();
          const id = crypto.randomUUID();
          const now = Date.now();

          const tagsJson = JSON.stringify(post.tags || []);

          await env.DB.prepare(
            `
            INSERT INTO posts (
              id, type, title, description, tags, media_url, thumbnail_url,
              created_at, updated_at, file_size, mime_type, width, height
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          )
            .bind(
              id,
              post.type,
              post.title,
              post.description,
              tagsJson,
              post.media_url,
              post.thumbnail_url,
              now,
              now,
              post.file_size,
              post.mime_type,
              post.width,
              post.height,
            )
            .run();

          return Response.json(
            {
              id,
              ...post,
              tags: post.tags || [],
              created_at: now,
              updated_at: now,
            },
            { headers: corsHeaders },
          );
        } catch (error) {
          return Response.json(
            { error: "Failed to create post" },
            {
              status: 500,
              headers: corsHeaders,
            },
          );
        }
      }

      // Fallback API response
      return Response.json(
        { error: "API endpoint not found" },
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    // Media serving route - /media/:fileKey
    if (url.pathname.startsWith("/media/")) {
      const fileKey = url.pathname.split("/media/")[1];

      try {
        const object = await env.STORAGE.get(fileKey);
        console.log("Serving file:", fileKey);

        if (!object) {
          return new Response("File not found", { status: 404 });
        }

        // Get the content type from the object metadata or guess from file extension
        const contentType =
          object.httpMetadata?.contentType || "application/octet-stream";

        return new Response(object.body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000", // Cache for 1 year
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response("Error serving file", { status: 500 });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
