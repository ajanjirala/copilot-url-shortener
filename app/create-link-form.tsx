'use client';

import { useActionState, useSyncExternalStore } from "react";
import { createLink } from "@/app/actions";

const subscribeToOrigin = () => () => undefined;
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

type CreateLinkState = {
  status: "success" | "error";
  message: string;
  shortCode?: string;
};

const initialState: CreateLinkState = {
  status: "error",
  message: "",
};

export default function CreateLinkForm() {
  const [state, formAction, pending] = useActionState(createLink, initialState);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getOrigin,
    getServerOrigin,
  );

  const shortPath = state.shortCode
    ? `/${encodeURIComponent(state.shortCode)}`
    : null;

  return (
    <section aria-labelledby="create-link-heading" className="border-b border-[#e1e7e1] py-8">
      <div className="mb-5">
        <h2 id="create-link-heading" className="text-lg font-semibold text-[#1d2923]">
          Create a link
        </h2>
        <p className="mt-1 text-sm text-[#68766e]">
          Turn a long destination into a link that is easy to share.
        </p>
      </div>

      <form action={formAction} className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="original_url" className="mb-1.5 block text-sm font-medium text-[#30483a]">
            Destination URL <span aria-hidden="true">*</span>
          </label>
          <input
            id="original_url"
            name="original_url"
            type="url"
            required
            placeholder="https://example.com/your-page"
            className="w-full rounded-md border border-[#d9e1da] bg-white px-3.5 py-2.5 text-sm text-[#1d2923] placeholder:text-[#89958d] focus:border-[#3b765a] focus:outline-2 focus:outline-offset-1 focus:outline-[#3b765a]"
          />
        </div>

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-[#30483a]">
            Title <span className="font-normal text-[#7b8780]">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Campaign or page name"
            className="w-full rounded-md border border-[#d9e1da] bg-white px-3.5 py-2.5 text-sm text-[#1d2923] placeholder:text-[#89958d] focus:border-[#3b765a] focus:outline-2 focus:outline-offset-1 focus:outline-[#3b765a]"
          />
        </div>

        <div>
          <label htmlFor="short_code" className="mb-1.5 block text-sm font-medium text-[#30483a]">
            Custom short code <span className="font-normal text-[#7b8780]">(optional)</span>
          </label>
          <input
            id="short_code"
            name="short_code"
            type="text"
            maxLength={32}
            pattern="[A-Za-z0-9_-]{1,32}"
            placeholder="my-link"
            className="w-full rounded-md border border-[#d9e1da] bg-white px-3.5 py-2.5 text-sm text-[#1d2923] placeholder:text-[#89958d] focus:border-[#3b765a] focus:outline-2 focus:outline-offset-1 focus:outline-[#3b765a]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#174b3a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#103b2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a] disabled:cursor-wait disabled:opacity-65"
          >
            {pending ? "Creating..." : "Create Link"}
          </button>

          {state.message && (
            <p
              role={state.status === "error" ? "alert" : "status"}
              aria-live={state.status === "error" ? "assertive" : "polite"}
              className={`text-sm ${state.status === "error" ? "text-[#9a432f]" : "text-[#28704f]"}`}
            >
              {state.message}
            </p>
          )}
        </div>

        {state.status === "success" && shortPath && (
          <div className="sm:col-span-2">
            <p className="text-sm font-medium text-[#30483a]">Your short URL</p>
            <a
              href={shortPath}
              className="mt-1 inline-block break-all text-sm font-semibold text-[#28704f] underline decoration-[#b8d4c2] underline-offset-4 hover:text-[#174b3a] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a]"
            >
              {origin ? `${origin}${shortPath}` : shortPath}
            </a>
          </div>
        )}
      </form>
    </section>
  );
}