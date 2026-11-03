"use client";

import { useActionState, useState } from "react";
import { updateLink } from "@/app/actions";

type EditLinkControlProps = {
  id: string | number;
  originalUrl: string;
  title: string | null;
  shortCode: string;
};

type UpdateLinkState = {
  status: "success" | "error";
  message: string;
};

const initialState: UpdateLinkState = {
  status: "error",
  message: "",
};

export default function EditLinkControl(props: EditLinkControlProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsEditing((editing) => !editing)}
        aria-expanded={isEditing}
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#d9e1da] bg-white px-3 py-2 text-sm font-medium text-[#30483a] transition-colors hover:border-[#9eb7a5] hover:bg-[#f8fbf8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a]"
      >
        {isEditing ? "Close editor" : "Edit"}
      </button>

      {isEditing && (
        <EditLinkForm
          {...props}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

function EditLinkForm({
  id,
  originalUrl: initialOriginalUrl,
  title: initialTitle,
  shortCode,
  onCancel,
}: EditLinkControlProps & { onCancel: () => void }) {
  const [state, formAction, pending] = useActionState(updateLink, initialState);

  const fieldClassName =
    "w-full rounded-md border border-[#d9e1da] bg-white px-3 py-2 text-sm text-[#1d2923] focus:border-[#3b765a] focus:outline-2 focus:outline-offset-1 focus:outline-[#3b765a]";

  return (
    <form
      key={JSON.stringify([id, initialOriginalUrl, initialTitle])}
      action={formAction}
      className="mt-3 grid w-[min(34rem,calc(100vw-4rem))] gap-3 border border-[#dfe6df] bg-[#fbfcfa] p-3"
    >
      <input type="hidden" name="id" value={String(id)} />

      <label className="block text-xs font-medium text-[#30483a]">
        Destination URL
        <input
          name="original_url"
          type="url"
          required
          defaultValue={initialOriginalUrl}
          className={`${fieldClassName} mt-1.5`}
        />
      </label>

      <label className="block text-xs font-medium text-[#30483a]">
        Title <span className="font-normal text-[#7b8780]">(optional)</span>
        <input
          name="title"
          type="text"
          defaultValue={initialTitle ?? ""}
          className={`${fieldClassName} mt-1.5`}
        />
      </label>

      <div>
        <span className="block text-xs font-medium text-[#30483a]">Short code</span>
        <span className="mt-1.5 block rounded-md border border-[#e3e9e3] bg-[#f2f5f1] px-3 py-2 text-sm text-[#68766e]">
          {shortCode}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-9 items-center justify-center rounded-md bg-[#174b3a] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#103b2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a] disabled:cursor-wait disabled:opacity-65"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#d9e1da] bg-white px-3 py-2 text-sm font-medium text-[#30483a] transition-colors hover:border-[#9eb7a5] hover:bg-[#f8fbf8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b765a] disabled:cursor-not-allowed disabled:opacity-65"
        >
          Cancel
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
    </form>
  );
}