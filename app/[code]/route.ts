import { getSql } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  try {
    const sql = getSql();
    const [link] = await sql`
      SELECT original_url
      FROM public.links
      WHERE short_code = ${code}
      LIMIT 1
    `;

    if (!link) {
      return new Response("Not Found", { status: 404 });
    }

    const destination = new URL(link.original_url);

    if (destination.protocol !== "http:" && destination.protocol !== "https:") {
      return new Response("Internal Server Error", { status: 500 });
    }

    return Response.redirect(destination, 307);
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}