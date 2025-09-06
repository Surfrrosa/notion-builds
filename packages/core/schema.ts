import { notion, parent } from "./notion.js";

type SelectOption = { name: string; color?: string };

export async function createOrUpdateDatabase(opts: {
  title: string;
  properties: Record<string, any>;
  icon?: { emoji: string };
}) {
  // For MVP we always create (idempotency can be added later by saving IDs)
  const res = await notion.databases.create({
    parent: parent(),
    title: [{ type: "text", text: { content: opts.title } }],
    icon: opts.icon ?? { type: "emoji", emoji: "🗂️" },
    properties: opts.properties
  });
  return res;
}

export const titleProp = { title: {} };
export const selectProp = (options: SelectOption[] = []) => ({ select: { options } });
export const richTextProp = { rich_text: {} };
export const numberProp = { number: {} };
export const dateProp = { date: {} };
export const checkboxProp = { checkbox: {} };
export const filesProp = { files: {} };
export const urlProp = { url: {} };