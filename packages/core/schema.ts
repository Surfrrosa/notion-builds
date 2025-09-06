import { notion, parent } from "./notion.js";
import fs from 'fs/promises';

type SelectOption = { name: string; color?: string };

export async function createOrUpdateDatabase(opts: {
  title: string;
  properties: Record<string, any>;
  icon?: { emoji: string };
}) {
  const stateFile = '.state.json';
  let state: any = {};
  try {
    state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  } catch {}
  
  if (state.databases?.[opts.title]) {
    console.log(`Database "${opts.title}" already exists, skipping...`);
    return { id: state.databases[opts.title] };
  }
  
  const res = await notion.databases.create({
    parent: parent(),
    title: [{ type: "text", text: { content: opts.title } }],
    icon: opts.icon ? { type: "emoji", emoji: opts.icon.emoji } as any : { type: "emoji", emoji: "🗂️" } as any,
    properties: opts.properties
  });
  
  state.databases = state.databases || {};
  state.databases[opts.title] = res.id;
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
  return res;
}

export const titleProp = { type: "title" as const, title: {} };
export const selectProp = (options: SelectOption[] = []) => ({ type: "select" as const, select: { options } });
export const richTextProp = { type: "rich_text" as const, rich_text: {} };
export const numberProp = { type: "number" as const, number: {} };
export const dateProp = { type: "date" as const, date: {} };
export const checkboxProp = { type: "checkbox" as const, checkbox: {} };
export const filesProp = { type: "files" as const, files: {} };
export const urlProp = { type: "url" as const, url: {} };
export const emailProp = { type: "email" as const, email: {} };
export const multiSelectProp = (options: SelectOption[] = []) => ({ type: "multi_select" as const, multi_select: { options } });
export const createdTimeProp = { type: "created_time" as const, created_time: {} };
export const relationProp = (data_source_id: string, synced_property_name?: string) => ({ 
  type: "relation" as const,
  relation: { 
    data_source_id,
    ...(synced_property_name && { 
      synced_property_name,
      synced_property_id: synced_property_name
    })
  }
});
export const rollupProp = (relation_property: string, rollup_property: string, function_type: string) => ({
  type: "rollup" as const,
  rollup: { relation_property_name: relation_property, rollup_property_name: rollup_property, function: function_type }
});
export const formulaProp = (expression: string) => ({ 
  type: "formula" as const,
  formula: { expression } 
});
