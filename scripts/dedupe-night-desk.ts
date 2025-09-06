import 'dotenv/config';
import { notion } from "../packages/core/notion.js";
import { readFile, writeFile } from 'fs/promises';

interface SearchResult {
  id: string;
  title: string;
  last_edited_time: string;
  children_count?: number;
}

interface DedupeResult {
  type: 'database' | 'page';
  name: string;
  keeper: SearchResult;
  duplicates: SearchResult[];
}

const CANONICAL_NAMES = {
  databases: [
    "Night Desk — Inbox",
    "Night Desk — Tasks", 
    "Night Desk — Projects",
    "Night Desk — Notes",
    "Night Desk — Assets",
    "Night Desk — People"
  ],
  pages: [
    "Night Desk — Home — Today",
    "Night Desk — Writing Scene",
    "Night Desk — Editing Scene", 
    "Night Desk — Admin Scene",
    "Night Desk — Review",
    "Night Desk — Template Root"
  ]
};

async function findAll(type: 'database' | 'page', name: string, parentPageId: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    const searchResponse = await notion.search({
      query: name,
      filter: {
        value: type,
        property: "object"
      }
    });

    for (const result of searchResponse.results) {
      if (result.object === type) {
        if (type === 'database') {
          const db = result as any;
          if (db.parent?.type === 'page_id' && db.parent.page_id === parentPageId) {
            results.push({
              id: db.id,
              title: db.title?.[0]?.plain_text || 'Untitled',
              last_edited_time: db.last_edited_time
            });
          }
        } else {
          const page = result as any;
          if (page.parent?.type === 'page_id' && page.parent.page_id === parentPageId) {
            results.push({
              id: page.id,
              title: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
              last_edited_time: page.last_edited_time
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to search for ${type} "${name}":`, error);
  }

  return results;
}

async function getChildrenCount(id: string): Promise<number> {
  try {
    const response = await notion.blocks.children.list({
      block_id: id,
      page_size: 1
    });
    return response.results.length;
  } catch {
    return 0;
  }
}

function chooseKeeper(candidates: SearchResult[]): SearchResult {
  if (candidates.length === 0) {
    throw new Error("No candidates provided");
  }
  
  if (candidates.length === 1) {
    return candidates[0];
  }

  const withoutEmoji = candidates.filter(c => 
    !/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(c.title)
  );
  
  if (withoutEmoji.length === 1) {
    return withoutEmoji[0];
  }
  
  const finalCandidates = withoutEmoji.length > 0 ? withoutEmoji : candidates;
  
  return finalCandidates.sort((a, b) => 
    new Date(b.last_edited_time).getTime() - new Date(a.last_edited_time).getTime()
  )[0];
}

async function createArchivePage(parentPageId: string): Promise<string> {
  const archiveName = `Archive — Night Desk (Temp) — ${new Date().toISOString().split('T')[0]}`;
  
  try {
    const response = await notion.pages.create({
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: archiveName } }]
        }
      },
      children: [{
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: { content: "Temporary archive for Night Desk duplicates during deduplication process." }
          }]
        }
      }]
    });
    
    return response.id;
  } catch (error) {
    console.error("Failed to create archive page:", error);
    throw error;
  }
}

async function archiveDuplicate(item: SearchResult, type: 'database' | 'page', archivePageId: string): Promise<void> {
  try {
    if (type === 'page') {
      try {
        await notion.pages.update({
          page_id: item.id,
          archived: true
        });
        console.log(`✅ Archived page: ${item.title}`);
      } catch {
        await notion.pages.update({
          page_id: item.id,
          parent: { page_id: archivePageId }
        });
        console.log(`📁 Moved page to archive: ${item.title}`);
      }
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').slice(0, 16);
      const newTitle = `DUPLICATE — ${item.title} — ${timestamp}`;
      
      await notion.databases.update({
        database_id: item.id,
        title: [{ type: "text", text: { content: newTitle } }],
        parent: { page_id: archivePageId }
      });
      console.log(`📁 Renamed and moved database: ${item.title} → ${newTitle}`);
    }
  } catch (error) {
    console.error(`Failed to archive ${type} ${item.title}:`, error);
  }
}

async function writeStateFile(keepers: Record<string, string>): Promise<void> {
  const stateFile = 'templates/night-desk/.state.json';
  
  try {
    let existingState: any = {};
    try {
      existingState = JSON.parse(await readFile(stateFile, 'utf8'));
    } catch {
    }

    const newState = {
      ...existingState,
      databases: {
        Inbox: keepers['Night Desk — Inbox'],
        Tasks: keepers['Night Desk — Tasks'],
        Projects: keepers['Night Desk — Projects'],
        Notes: keepers['Night Desk — Notes'],
        Assets: keepers['Night Desk — Assets'],
        People: keepers['Night Desk — People']
      },
      pages: {
        templateRoot: keepers['Night Desk — Template Root'],
        home: keepers['Night Desk — Home — Today'],
        writingScene: keepers['Night Desk — Writing Scene'],
        editingScene: keepers['Night Desk — Editing Scene'],
        adminScene: keepers['Night Desk — Admin Scene'],
        reviewPage: keepers['Night Desk — Review']
      },
      lastDeduped: new Date().toISOString()
    };

    await writeFile(stateFile, JSON.stringify(newState, null, 2));
    console.log(`✅ Updated state file: ${stateFile}`);
  } catch (error) {
    console.error("Failed to write state file:", error);
    throw error;
  }
}

async function main() {
  const parentPageId = process.env.PARENT_PAGE_ID;
  if (!parentPageId) {
    console.error("❌ PARENT_PAGE_ID environment variable is required");
    process.exit(1);
  }

  console.log("🔍 Starting Night Desk deduplication process...\n");

  const results: DedupeResult[] = [];
  const keepers: Record<string, string> = {};
  let archivePageId: string | null = null;

  for (const dbName of CANONICAL_NAMES.databases) {
    console.log(`Searching for database: ${dbName}`);
    const candidates = await findAll('database', dbName, parentPageId);
    
    if (candidates.length === 0) {
      console.log(`⚠️  No databases found for: ${dbName}`);
      continue;
    }

    const keeper = chooseKeeper(candidates);
    const duplicates = candidates.filter(c => c.id !== keeper.id);
    
    keepers[dbName] = keeper.id;
    results.push({
      type: 'database',
      name: dbName,
      keeper,
      duplicates
    });

    if (duplicates.length > 0) {
      if (!archivePageId) {
        archivePageId = await createArchivePage(parentPageId);
      }
      
      for (const duplicate of duplicates) {
        await archiveDuplicate(duplicate, 'database', archivePageId);
      }
    }
  }

  for (const pageName of CANONICAL_NAMES.pages) {
    console.log(`Searching for page: ${pageName}`);
    const candidates = await findAll('page', pageName, parentPageId);
    
    if (candidates.length === 0) {
      console.log(`⚠️  No pages found for: ${pageName}`);
      continue;
    }

    const keeper = chooseKeeper(candidates);
    const duplicates = candidates.filter(c => c.id !== keeper.id);
    
    keepers[pageName] = keeper.id;
    results.push({
      type: 'page',
      name: pageName,
      keeper,
      duplicates
    });

    if (duplicates.length > 0) {
      if (!archivePageId) {
        archivePageId = await createArchivePage(parentPageId);
      }
      
      for (const duplicate of duplicates) {
        await archiveDuplicate(duplicate, 'page', archivePageId);
      }
    }
  }

  await writeStateFile(keepers);

  console.log("\n📊 Deduplication Results:");
  console.log("=".repeat(80));
  console.log("| Type     | Name                          | Keeper ID        | Duplicates |");
  console.log("|----------|-------------------------------|------------------|------------|");
  
  for (const result of results) {
    const shortId = result.keeper.id.slice(0, 8) + "...";
    const shortName = result.name.length > 29 ? result.name.slice(0, 26) + "..." : result.name;
    console.log(`| ${result.type.padEnd(8)} | ${shortName.padEnd(29)} | ${shortId.padEnd(16)} | ${result.duplicates.length.toString().padEnd(10)} |`);
  }

  const totalDuplicates = results.reduce((sum, r) => sum + r.duplicates.length, 0);
  console.log("\n📈 Summary:");
  console.log(`- Total items processed: ${results.length}`);
  console.log(`- Total duplicates archived/moved: ${totalDuplicates}`);
  console.log(`- Archive page created: ${archivePageId ? 'Yes' : 'No'}`);
  
  if (totalDuplicates === 0) {
    console.log("🎉 No duplicates found! Night Desk is already clean.");
  } else {
    console.log("✅ Deduplication completed successfully!");
  }
}

main().catch(error => {
  console.error("💥 Deduplication failed:", error);
  process.exit(1);
});
