import { Hono } from "hono";
import { cors } from "hono/cors";
import type { R2Bucket, D1Database } from "@cloudflare/workers-types";
import type { Context, Next } from "hono";

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  AUTH_KEY_SECRET: string;
  ENVIRONMENT?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-Custom-Auth-Key"],
  }),
);

// Auth middleware for protected routes
const authMiddleware = async (
  c: Context<{ Bindings: Bindings }>,
  next: Next,
) => {
  const method = c.req.method;

  if (method === "PUT" || method === "DELETE") {
    const headerValue = c.req.header("X-Custom-Auth-Key");
    const expectedValue = c.env.AUTH_KEY_SECRET;

    if (headerValue !== expectedValue) {
      return c.text("Forbidden", 403);
    }
  }

  await next();
};

// Apply auth to all /api routes
app.use("/api/*", authMiddleware);

// GET /api/posts
app.get("/api/posts", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM posts ORDER BY created_at DESC`,
    ).all();

    const posts = results.map((post) => ({
      ...post,
    }));

    return c.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

export default app;
