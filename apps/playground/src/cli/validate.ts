import { LIMITS } from "../recipes-manifest.js";
import { slugify } from "./slug.js";

/** Prompt validators: a message string means invalid, `undefined` means valid. */
export type ValidationResult = string | undefined;

function hasControlCharacters(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

export function validateRecipeName(
  value: string | undefined,
  existingSlugs: Iterable<string>,
): ValidationResult {
  const name = (value ?? "").trim();
  if (name === "") return "A recipe name is required.";
  if (name.length > LIMITS.title)
    return `The name must be at most ${LIMITS.title} characters (got ${name.length}).`;
  if (hasControlCharacters(name))
    return "The name must not contain control characters.";
  const slug = slugify(name);
  if (slug === "")
    return "The name needs at least one letter or digit to derive a slug from.";
  for (const existing of existingSlugs)
    if (existing === slug)
      return `A recipe with the slug "${slug}" already exists.`;
  return;
}

export function validateDescription(
  value: string | undefined,
): ValidationResult {
  const description = (value ?? "").trim();
  if (description.length > LIMITS.description)
    return `The description must be at most ${LIMITS.description} characters (got ${description.length}).`;
  if (hasControlCharacters(description))
    return "The description must not contain control characters.";
  return;
}

export function validateChanges(value: string | undefined): ValidationResult {
  const changes = (value ?? "").trim();
  if (changes === "") return "Describe what changed.";
  if (changes.length > LIMITS.changes)
    return `The changes must be at most ${LIMITS.changes} characters (got ${changes.length}).`;
  if (hasControlCharacters(changes))
    return "The changes must not contain control characters.";
  return;
}
