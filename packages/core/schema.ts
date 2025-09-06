import { notion } from "./notion.js";
import type { 
  CreateDatabaseParameters,
  DatabaseObjectResponse 
} from "@notionhq/client/build/src/api-endpoints";

type DatabaseProperties = CreateDatabaseParameters["properties"];

export const titleProp = { title: {} };
export const richTextProp = { rich_text: {} };
export const numberProp = { number: {} };
export const dateProp = { date: {} };
export const checkboxProp = { checkbox: {} };
export const urlProp = { url: {} };
export const filesProp = { files: {} };

export function selectProp(options: { name: string; color?: string }[]) {
  return { select: { options } };
}

export async function createOrUpdateDatabase({
  title,
  icon,
  properties
}: {
  title: string;
  icon?: { emoji: string };
  properties: DatabaseProperties;
}): Promise<DatabaseObjectResponse> {
  
  const parentPageId = process.env.PARENT_PAGE_ID!;
  
  const response = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: title } }],
    icon: icon || { type: "emoji", emoji: "📋" },
    properties
  });
  
  console.log(`✅ Created database: ${title}`);
  return response as DatabaseObjectResponse;
}