import 'dotenv/config';
import { notion } from "../packages/core/notion.js";
import { readFile } from 'fs/promises';

interface ResurfaceItem {
  id: string;
  name: string;
  type: 'Task' | 'Note';
  lastEdited: string;
  resurfaceDate: string;
}

async function getResurfacingItems(): Promise<ResurfaceItem[]> {
  const stateFile = '.state.json';
  let state: any = {};
  try {
    state = JSON.parse(await readFile(stateFile, 'utf8'));
  } catch {
    console.error("❌ .state.json file not found. Run 'npm run build:night-desk' first.");
    process.exit(1);
  }

  if (!state.databases) {
    console.error("❌ No databases found in state. Run 'npm run build:night-desk' first.");
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const items: ResurfaceItem[] = [];

  if (state.databases["Tasks"]) {
    try {
      const tasksResponse = await notion.databases.query({
        database_id: state.databases["Tasks"],
        filter: {
          property: "Resurface On",
          date: {
            equals: today
          }
        },
        sorts: [
          {
            property: "Last edited time",
            direction: "descending"
          }
        ]
      });

      for (const page of tasksResponse.results) {
        const pageData = page as any;
        const name = pageData.properties.Name?.title?.[0]?.text?.content || "Untitled";
        const lastEdited = pageData.last_edited_time;
        const resurfaceDate = pageData.properties["Resurface On"]?.date?.start || today;

        items.push({
          id: pageData.id,
          name,
          type: 'Task',
          lastEdited,
          resurfaceDate
        });
      }
    } catch (error) {
      console.error("❌ Failed to query Tasks database:", error);
    }
  }

  if (state.databases["Notes"]) {
    try {
      const notesResponse = await notion.databases.query({
        database_id: state.databases["Notes"],
        filter: {
          property: "Resurface On",
          date: {
            equals: today
          }
        },
        sorts: [
          {
            property: "Last edited time",
            direction: "descending"
          }
        ]
      });

      for (const page of notesResponse.results) {
        const pageData = page as any;
        const name = pageData.properties.Name?.title?.[0]?.text?.content || "Untitled";
        const lastEdited = pageData.last_edited_time;
        const resurfaceDate = pageData.properties["Resurface On"]?.date?.start || today;

        items.push({
          id: pageData.id,
          name,
          type: 'Note',
          lastEdited,
          resurfaceDate
        });
      }
    } catch (error) {
      console.error("❌ Failed to query Notes database:", error);
    }
  }

  return items;
}

async function applyResurfacingCap(items: ResurfaceItem[], dryRun: boolean = true): Promise<void> {
  const tasks = items.filter(item => item.type === 'Task');
  const notes = items.filter(item => item.type === 'Note');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  let tasksToDefer: ResurfaceItem[] = [];
  let notesToDefer: ResurfaceItem[] = [];

  if (tasks.length > 3) {
    tasks.sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime());
    tasksToDefer = tasks.slice(3); // Everything after the first 3
  }

  if (notes.length > 3) {
    notes.sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime());
    notesToDefer = notes.slice(3); // Everything after the first 3
  }

  const totalToDefer = tasksToDefer.length + notesToDefer.length;

  if (totalToDefer === 0) {
    console.log("✅ No items need to be deferred. Daily cap is within limits.");
    console.log(`📊 Current resurfacing today: ${tasks.length} Tasks, ${notes.length} Notes`);
    return;
  }

  console.log(`📊 Resurfacing Analysis:`);
  console.log(`- Tasks resurfacing today: ${tasks.length} (keeping 3 most recent)`);
  console.log(`- Notes resurfacing today: ${notes.length} (keeping 3 most recent)`);
  console.log(`- Items to defer to tomorrow: ${totalToDefer}`);

  if (dryRun) {
    console.log("\n🔍 DRY RUN - Items that would be deferred:");
    [...tasksToDefer, ...notesToDefer].forEach(item => {
      console.log(`  - ${item.type}: "${item.name}" (last edited: ${new Date(item.lastEdited).toLocaleString()})`);
    });
    console.log("\nRun with --apply flag to actually defer these items.");
    return;
  }

  console.log("\n⏭️  Deferring items to tomorrow...");

  for (const item of [...tasksToDefer, ...notesToDefer]) {
    try {
      await notion.pages.update({
        page_id: item.id,
        properties: {
          "Resurface On": {
            date: {
              start: tomorrowStr
            }
          }
        }
      });
      console.log(`✅ Deferred ${item.type}: "${item.name}"`);
    } catch (error) {
      console.error(`❌ Failed to defer ${item.type} "${item.name}":`, error);
    }
  }

  console.log(`\n🎉 Successfully deferred ${totalToDefer} items to tomorrow.`);
}

async function main() {
  const args = process.argv.slice(2);
  const applyFlag = args.includes('--apply');
  const dryRun = !applyFlag;

  console.log("🔄 Daily Resurfacing Cap Helper");
  console.log("=".repeat(40));
  
  if (dryRun) {
    console.log("🔍 Running in DRY RUN mode (use --apply to make changes)");
  } else {
    console.log("⚡ APPLY mode - changes will be made");
  }

  try {
    const items = await getResurfacingItems();
    await applyResurfacingCap(items, dryRun);
  } catch (error) {
    console.error("💥 Review cap script failed:", error);
    process.exit(1);
  }
}

main();
