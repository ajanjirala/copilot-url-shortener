import Link from "next/link";
import { Suspense } from "react";
import CreateLinkForm from "@/app/create-link-form";
import DeleteLinkControl, { DeleteLinkFeedback } from "@/app/delete-link-control";
import EditLinkControl from "@/app/edit-link-form";
import { getSql } from "@/lib/db";

type LinkRecord = {
  id: string | number;
  title: string | null;
  original_url: string;
  short_code: string;
  created_at: Date | string;
};

function formatDate(value: LinkRecord["created_at"]) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function Home() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#1d2923]">
      <header className="border-b border-[#e2e8e2] bg-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-[#174b3a] text-sm font-bold text-white">
              L
            </span>
            <span className="text-[15px] font-semibold text-[#1d2923]">linkdesk</span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:pt-12">
        <section>
          <p className="mb-2 text-xs font-semibold uppercase text-[#668071]">
            Workspace
          </p>
          <h1 className="text-3xl font-semibold text-[#1d2923] sm:text-[34px]">
            Your links
          </h1>
        </section>
        <p role="status" className="mt-8 text-sm text-[#68766e]">
          Loading link data...
        </p>
      </div>
    </main>
  );
}

async function DashboardContent() {
  let links: LinkRecord[] | null = null;

  try {
    const sql = getSql();
    links = (await sql`
      SELECT id, title, original_url, short_code, created_at
      FROM public.links
      ORDER BY created_at DESC
    `) as LinkRecord[];
  } catch {
    links = null;
  }

  const totalLinks = links?.length ?? null;

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#1d2923]">
      <header className="border-b border-[#e2e8e2] bg-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Linkdesk home">
            <span className="flex size-9 items-center justify-center rounded-md bg-[#174b3a] text-sm font-bold text-white">
              L
            </span>
            <span className="text-[15px] font-semibold tracking-normal text-[#1d2923]">
              linkdesk
            </span>
          </Link>
          <span className="rounded-full border border-[#dce7df] bg-[#f5faf6] px-3 py-1.5 text-xs font-medium text-[#34634d]">
            URL dashboard
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pb-12 pt-9 sm:px-8 sm:pt-12">
        <section className="flex flex-col justify-between gap-6 border-b border-[#e1e7e1] pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-[#668071]">
              Workspace
            </p>
            <h1 className="text-3xl font-semibold text-[#1d2923] sm:text-[34px]">
              Your links
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#68766e]">
              A clear view of every destination and its short link.
            </p>
          </div>
          <a
            href="#links"
            className="inline-flex w-fit items-center gap-2 rounded-md border border-[#d9e1da] bg-white px-4 py-2.5 text-sm font-medium text-[#30483a] transition-colors hover:border-[#9eb7a5] hover:bg-[#f8fbf8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a]"
          >
            Browse links
            <span aria-hidden="true">&darr;</span>
          </a>
        </section>

        <section
          aria-label="Link statistics"
          className="grid grid-cols-1 gap-5 border-b border-[#e1e7e1] py-7 sm:grid-cols-[minmax(0,1fr)_minmax(220px,2fr)] sm:items-center"
        >
          <div>
            <p className="text-sm font-medium text-[#68766e]">Total links</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums text-[#1d2923]">
              {totalLinks === null ? "--" : totalLinks.toLocaleString("en-US")}
            </p>
          </div>
          <p className="max-w-lg border-l-2 border-[#b9d1c0] pl-4 text-sm leading-6 text-[#68766e]">
            {totalLinks === null
              ? "Link data is temporarily unavailable."
              : `${totalLinks === 1 ? "One link" : `${totalLinks.toLocaleString("en-US")} links`} in your workspace.`}
          </p>
        </section>

        <CreateLinkForm />

        <section id="links" className="pt-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="text-lg font-semibold text-[#1d2923]">All links</h2>
              <p className="mt-1 text-sm text-[#68766e]">
                Your shortened URLs and their destinations.
              </p>
            </div>
            {totalLinks !== null && (
              <span className="text-sm tabular-nums text-[#68766e]">
                {totalLinks.toLocaleString("en-US")} {totalLinks === 1 ? "record" : "records"}
              </span>
            )}
          </div>

          <DeleteLinkFeedback />

          {links === null ? (
            <div
              role="alert"
              className="border border-[#ead9ca] bg-[#fffaf5] px-5 py-6 sm:px-7"
            >
              <h3 className="font-semibold text-[#573b2d]">Could not load your links</h3>
              <p className="mt-1 text-sm leading-6 text-[#795f50]">
                The link list is temporarily unavailable. Please try again later.
              </p>
            </div>
          ) : links.length === 0 ? (
            <div className="border border-dashed border-[#cbd7cd] bg-white px-5 py-12 text-center sm:px-7">
              <h3 className="font-semibold text-[#30483a]">No links yet</h3>
              <p className="mt-2 text-sm text-[#68766e]">
                Shortened URLs will appear here once they are added.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden border border-[#dfe6df] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead className="bg-[#f7f9f6]">
                    <tr className="border-b border-[#e3e9e3]">
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase text-[#718078]">
                        Title
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase text-[#718078]">
                        Original URL
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase text-[#718078]">
                        Short code
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase text-[#718078]">
                        Created
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase text-[#718078]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0ed]">
                    {links.map((link) => (
                      <tr
                        key={link.short_code}
                        className="transition-colors hover:bg-[#fbfcfa]"
                      >
                        <td className="max-w-[200px] px-5 py-4 text-sm font-medium text-[#29382f]">
                          <span className="block truncate">
                            {link.title?.trim() || "Untitled link"}
                          </span>
                        </td>
                        <td className="max-w-[360px] px-5 py-4 text-sm text-[#68766e]">
                          <span className="block truncate" title={link.original_url}>
                            {link.original_url}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <a
                            href={`/${encodeURIComponent(link.short_code)}`}
                            className="font-semibold text-[#28704f] underline decoration-[#b8d4c2] underline-offset-4 transition-colors hover:text-[#174b3a] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a]"
                          >
                            {link.short_code}
                          </a>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-[#68766e]">
                          {formatDate(link.created_at)}
                        </td>
                        <td className="px-5 py-4 align-top text-sm">
                          <div className="flex items-start gap-2">
                            <EditLinkControl
                              id={link.id}
                              originalUrl={link.original_url}
                              title={link.title}
                              shortCode={link.short_code}
                            />
                            <DeleteLinkControl
                              id={link.id}
                              originalUrl={link.original_url}
                              title={link.title}
                              shortCode={link.short_code}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#e7ece7] px-5 py-3 text-xs text-[#7b8780]">
                Showing all {links.length.toLocaleString("en-US")} {links.length === 1 ? "link" : "links"}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
