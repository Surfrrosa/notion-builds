import 'dotenv/config';
import { Client } from "@notionhq/client";

export const notion = new Client({ auth: process.env.NOTION_TOKEN });

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in .env`);
  return v;
}

export function parent() {
  const PARENT_PAGE_ID = requireEnv('PARENT_PAGE_ID');
  return { type: "page_id", page_id: PARENT_PAGE_ID } as const;
}