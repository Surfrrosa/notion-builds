import 'dotenv/config';
import { notion } from "../packages/core/notion.js";
import { readFile } from 'fs/promises';

async function clearDemoData() {
  const stateFile = '.state.json';
  let state: any = {};
  try {
    state = JSON.parse(await readFile(stateFile, 'utf8'));
  } catch {
    console.error("No .state.json found. Run 'npm run build:night-desk' first.");
    process.exit(1);
  }

  if (!state.databases) {
    console.error("No databases found in state. Run 'npm run build:night-desk' first.");
    process.exit(1);
  }

  console.log("Clearing demo data from all databases...");

  const databases = ["Inbox", "Tasks", "Projects", "Notes", "Assets", "People"];
  
  for (const dbName of databases) {
    const dbId = state.databases[dbName];
    if (!dbId) {
      console.log(`Database ${dbName} not found, skipping...`);
      continue;
    }

    console.log(`Processing ${dbName}...`);
    
    const response = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: "Demo",
        checkbox: {
          equals: true
        }
      }
    });

    for (const page of response.results) {
      await notion.pages.update({
        page_id: page.id,
        properties: {
          "Demo": { checkbox: false }
        }
      });
    }

    console.log(`✅ Archived ${response.results.length} demo items from ${dbName}`);
  }

  console.log("\n🎉 All demo data has been archived!");
  console.log("Demo items are now hidden from default views but preserved for reference.");
}

clearDemoData().catch(err => {
  console.error("Clear demo failed:", err);
  process.exit(1);
});
