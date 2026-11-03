'use server';

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSql } from "@/lib/db";

type CreateLinkState = {
  status: "success" | "error";
  message: string;
  shortCode?: string;
};

type UpdateLinkState = {
  status: "success" | "error";
  message: string;
};

type DeleteLinkState = {
  status: "success" | "error";
  message: string;
};

const MAX_GENERATED_CODE_ATTEMPTS = 5;

function generateShortCode(): string {
  return randomBytes(6).toString("base64url");
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function createLink(
  _previousState: CreateLinkState,
  formData: FormData,
): Promise<CreateLinkState> {
  const originalUrlValue = formData.get("original_url");

  if (typeof originalUrlValue !== "string" || !originalUrlValue.trim()) {
    return { status: "error", message: "Enter a URL to shorten." };
  }

  const originalUrl = originalUrlValue.trim();
  let destination: URL;

  try {
    destination = new URL(originalUrl);
  } catch {
    return { status: "error", message: "Enter a valid HTTP or HTTPS URL." };
  }

  if (
    (destination.protocol !== "http:" && destination.protocol !== "https:") ||
    !destination.hostname
  ) {
    return { status: "error", message: "Enter a valid HTTP or HTTPS URL." };
  }

  const titleValue = formData.get("title");
  const shortCodeValue = formData.get("short_code");

  if (
    (titleValue !== null && typeof titleValue !== "string") ||
    (shortCodeValue !== null && typeof shortCodeValue !== "string")
  ) {
    return { status: "error", message: "Check the submitted link details." };
  }

  const title = titleValue?.trim() || null;
  const requestedShortCode = shortCodeValue?.trim() || null;

  if (
    requestedShortCode &&
    !/^[A-Za-z0-9_-]{1,32}$/.test(requestedShortCode)
  ) {
    return {
      status: "error",
      message:
        "Short codes can contain only letters, numbers, hyphens, and underscores, up to 32 characters.",
    };
  }

  const attempts = requestedShortCode ? 1 : MAX_GENERATED_CODE_ATTEMPTS;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const shortCode = requestedShortCode ?? generateShortCode();

    try {
      const sql = getSql();
      await sql`
        INSERT INTO public.links (original_url, short_code, title)
        VALUES (${originalUrl}, ${shortCode}, ${title})
      `;
    } catch (error) {
      if (isUniqueViolation(error)) {
        if (requestedShortCode) {
          return {
            status: "error",
            message: "That short code is already in use. Choose another.",
          };
        }

        if (attempt < attempts - 1) {
          continue;
        }

        return {
          status: "error",
          message: "Could not generate an available short code. Please try again.",
        };
      }

      return {
        status: "error",
        message: "Could not create the link. Please try again later.",
      };
    }

    revalidatePath("/");
    return {
      status: "success",
      message: "Link created successfully.",
      shortCode,
    };
  }

  return {
    status: "error",
    message: "Could not create the link. Please try again later.",
  };
}

export async function updateLink(
  _previousState: UpdateLinkState,
  formData: FormData,
): Promise<UpdateLinkState> {
  const idValue = formData.get("id");
  const originalUrlValue = formData.get("original_url");
  const titleValue = formData.get("title");

  if (typeof idValue !== "string" || !idValue.trim()) {
    return { status: "error", message: "Select a link to update." };
  }

  if (typeof originalUrlValue !== "string" || !originalUrlValue.trim()) {
    return { status: "error", message: "Enter a destination URL." };
  }

  if (titleValue !== null && typeof titleValue !== "string") {
    return { status: "error", message: "Check the submitted link details." };
  }

  const id = idValue.trim();
  const originalUrl = originalUrlValue.trim();
  let destination: URL;

  try {
    destination = new URL(originalUrl);
  } catch {
    return { status: "error", message: "Enter a valid HTTP or HTTPS URL." };
  }

  if (
    (destination.protocol !== "http:" && destination.protocol !== "https:") ||
    !destination.hostname
  ) {
    return { status: "error", message: "Enter a valid HTTP or HTTPS URL." };
  }

  const title = titleValue?.trim() || null;

  let updatedLink: Record<string, unknown> | undefined;

  try {
    const sql = getSql();
    [updatedLink] = await sql`
      UPDATE public.links
      SET original_url = ${originalUrl}, title = ${title}
      WHERE id = ${id}
      RETURNING id
    `;
  } catch {
    return {
      status: "error",
      message: "Could not update the link. Please try again later.",
    };
  }

  if (!updatedLink) {
    return {
      status: "error",
      message: "That link could not be found. Refresh and try again.",
    };
  }

  revalidatePath("/");
  return { status: "success", message: "Link updated successfully." };
}

export async function deleteLink(
  _previousState: DeleteLinkState,
  formData: FormData,
): Promise<DeleteLinkState> {
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue.trim() : "";

  if (
    !/^[1-9]\d{0,19}$/.test(id) ||
    (id.length === 20 && id > "9223372036854775807")
  ) {
    return { status: "error", message: "Select a valid link to delete." };
  }

  let deletedLink: Record<string, unknown> | undefined;

  try {
    const sql = getSql();
    [deletedLink] = await sql`
      DELETE FROM public.links
      WHERE id = ${id}
      RETURNING id
    `;
  } catch {
    return {
      status: "error",
      message: "Could not delete the link. Please try again later.",
    };
  }

  if (!deletedLink) {
    return {
      status: "error",
      message: "That link could not be found. Refresh and try again.",
    };
  }

  revalidatePath("/");
  return { status: "success", message: "Link deleted successfully." };
}