import { serve } from "std/http/server.ts";

const HTML_FILE_PATH = "./public/index.html";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  if (url.pathname === "/") {
    try {
      const htmlContent = await Deno.readTextFile(HTML_FILE_PATH);
      return new Response(htmlContent, {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    } catch (error) {
      console.error("Error reading HTML file:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
  return new Response("Not Found", { status: 404 });
};

const port = 8000;
console.log(`Server running on http://localhost:${port}/`);
serve(handler, { port });
