import { serve } from "std/http/server.ts";
import { loadSync } from "std/dotenv/mod.ts";

// Load environment variables from .env file
loadSync({ allowEmptyValues: true, export: true });
import { tryCatch, isLeft, FileError } from "./utils/either.ts";

const HTML_FILE_PATH = "./public/index.html";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname === "/") {
    const htmlContentEither = await tryCatch(
      () => Deno.readTextFile(HTML_FILE_PATH),
      (e) => new FileError(`Failed to read HTML file: ${HTML_FILE_PATH}`, e),
    );

    if (isLeft(htmlContentEither)) {
      console.error(htmlContentEither.left);
      return new Response("Internal Server Error", { status: 500 });
    }

    return new Response(htmlContentEither.right, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }
  return new Response("Not Found", { status: 404 });
};

const port = parseInt(Deno.env.get("PORT") || "3500");
console.log(`Attempting to start server on port: ${port}`);
console.log(`Server running on http://localhost:${port}/`);
serve(handler, { port });
