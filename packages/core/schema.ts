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
  
  const parentPageId = process.env.PARENT_PAGE_ID;
  if (parentPageId) {
    try {
      const searchResponse = await notion.search({
        query: opts.title,
        filter: { value: "database", property: "object" }
      });
      
      for (const result of searchResponse.results) {
        const db = result as any;
        if (db.parent?.type === 'page_id' && 
            db.parent.page_id === parentPageId && 
            db.title?.[0]?.plain_text === opts.title) {
          console.log(`Database "${opts.title}" found via search, updating state...`);
          state.databases = state.databases || {};
          state.databases[opts.title] = db.id;
          await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
          return { id: db.id };
        }
      }
    } catch (error) {
      console.warn(`Search failed for database "${opts.title}":`, error);
    }
  }
  
  if (state.databases?.[opts.title]) {
    console.log(`Database "${opts.title}" found in state, skipping...`);
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
export const relationSingle = (databaseId: string) => ({
  type: "relation" as const,
  relation: { database_id: databaseId, type: "single_property", single_property: {} },
});

export const relationDualById = (databaseId: string, syncedId: string) => ({
  type: "relation" as const,
  relation: {
    database_id: databaseId,
    type: "dual_property",
    dual_property: { synced_property_id: syncedId },
  },
});

export const relationDualByName = (databaseId: string, name: string) => ({
  type: "relation" as const,
  relation: {
    database_id: databaseId,
    type: "dual_property",
    dual_property: { synced_property_name: name },
  },
});

export const relationProp = (databaseId: string) => relationSingle(databaseId);
export const rollupProp = (relation_property: string, rollup_property: string, function_type: string) => ({
  type: "rollup" as const,
  rollup: { relation_property_name: relation_property, rollup_property_name: rollup_property, function: function_type }
});
export const formulaProp = (expression: string) => ({ 
  type: "formula" as const,
  formula: { expression } 
});

type DualOpts = {
  aDbId: string; aProp: string;
  bDbId: string; bProp: string;
};

export async function ensureDualRelation(notion: any, { aDbId, aProp, bDbId, bProp }: DualOpts) {
  await notion.databases.update({
    database_id: aDbId,
    properties: { [aProp]: relationSingle(bDbId) },
  });
  const aDb = await notion.databases.retrieve({ database_id: aDbId });
  const aPropId = (aDb as any).properties[aProp].id;

  await notion.databases.update({
    database_id: bDbId,
    properties: { [bProp]: relationSingle(aDbId) },
  });
  const bDb = await notion.databases.retrieve({ database_id: bDbId });
  const bPropId = (bDb as any).properties[bProp].id;

  try {
    await notion.databases.update({
      database_id: aDbId,
      properties: { [aProp]: relationDualById(bDbId, bPropId) },
    });
    await notion.databases.update({
      database_id: bDbId,
      properties: { [bProp]: relationDualById(aDbId, aPropId) },
    });
    console.log(`✅ Dual relation created: ${aProp} ↔ ${bProp}`);
    return { type: 'dual', aPropId, bPropId };
  } catch (e) {
    console.warn(`⚠️ Dual relation unsupported in this workspace. Using single_property only for ${aProp} ↔ ${bProp}`, (e as any)?.body || e);
    return { type: 'single', aPropId, bPropId };
  }
}
