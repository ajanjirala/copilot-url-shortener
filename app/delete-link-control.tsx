"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLink } from "@/app/actions";

type DeleteLinkState = {
  status: "success" | "error";
  message: string;
};

type DeleteLinkControlProps = {
  id: string | number;
  originalUrl: string;
  title: string | null;
  shortCode: string;
};

const initialState: DeleteLinkState = {
  status: "error",
  message: "",
};

const feedbackEventName = "linkdesk:delete-feedback";

export function DeleteLinkFeedback() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    function showFeedback(event: Event) {
      if (event instanceof CustomEvent && typeof event.detail === "string") {
        setMessage(event.detail);
      }
    }

    window.addEventListener(feedbackEventName, showFeedback);
    return () => window.removeEventListener(feedbackEventName, showFeedback);
  }, []);

  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border border-[#c9dfce] bg-[#f3faf4] px-4 py-3 text-sm text-[#28704f]"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setMessage("")}
        className="font-semibold underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a]"
      >
        Dismiss
      </button>
    </p>
  );
}

export default function DeleteLinkControl({
  id,
  originalUrl,
  title,
  shortCode,
}: DeleteLinkControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const headingId = useId();

  async function submitDelete(
    previousState: DeleteLinkState,
    formData: FormData,
  ) {
    const result = await deleteLink(previousState, formData);

    if (result.status === "success") {
      window.dispatchEvent(
        new CustomEvent(feedbackEventName, { detail: result.message }),
      );
      router.refresh();
    }

    return result;
  }

  const [state, formAction, pending] = useActionState(
    submitDelete,
    initialState,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#e4c9c1] bg-white px-3 py-2 text-sm font-medium text-[#994936] transition-colors hover:border-[#c98e7e] hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a84e37]"
      >
        Delete
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17241dcc] p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="w-full max-w-lg border border-[#dfe6df] bg-white p-5 shadow-xl sm:p-6"
          >
            <h2 id={headingId} className="text-lg font-semibold text-[#1d2923]">
              Delete this link?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#68766e]">
              This will permanently remove the selected short link.
            </p>

            <dl className="mt-5 grid gap-3 border-y border-[#e7ece7] py-4 text-sm">
              <div>
                <dt className="font-medium text-[#30483a]">Title</dt>
                <dd className="mt-1 break-words text-[#68766e]">
                  {title?.trim() || "Untitled link"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[#30483a]">Destination</dt>
                <dd className="mt-1 break-all text-[#68766e]">{originalUrl}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#30483a]">Short code</dt>
                <dd className="mt-1 text-[#68766e]">{shortCode}</dd>
              </div>
            </dl>

            <form action={formAction} className="mt-5">
              <input type="hidden" name="id" value={String(id)} />
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={pending}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#d9e1da] bg-white px-4 py-2 text-sm font-medium text-[#30483a] transition-colors hover:border-[#9eb7a5] hover:bg-[#f8fbf8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#a34330] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#873624] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a84e37] disabled:cursor-wait disabled:opacity-65"
                >
                  {pending ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
              {state.message && state.status === "error" && (
                <p role="alert" aria-live="assertive" className="mt-3 text-sm text-[#9a432f]">
                  {state.message}
                </p>
              )}
            </form>
          </section>
        </div>
      )}
    </>
  );
}