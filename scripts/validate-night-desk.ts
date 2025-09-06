import 'dotenv/config';
import { notion } from "../packages/core/notion.js";
import { readFile } from 'fs/promises';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

async function validateNightDesk(): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: []
  };

  console.log("🔍 Validating Night Desk template...\n");

  let state: any = {};
  try {
    state = JSON.parse(await readFile('.state.json', 'utf8'));
  } catch {
    result.errors.push("❌ .state.json file not found. Run 'npm run build:night-desk' first.");
    result.success = false;
    return result;
  }

  const requiredDatabases = ["Inbox", "Tasks", "Projects", "Notes", "Assets", "People"];
  const missingDatabases: string[] = [];

  for (const dbName of requiredDatabases) {
    if (!state.databases?.[dbName]) {
      missingDatabases.push(dbName);
    }
  }

  if (missingDatabases.length > 0) {
    result.errors.push(`❌ Missing databases: ${missingDatabases.join(", ")}`);
    result.success = false;
  } else {
    console.log("✅ All 6 databases found in state");
  }

  for (const dbName of requiredDatabases) {
    if (state.databases?.[dbName]) {
      try {
        const dbId = state.databases[dbName];
        const database = await notion.databases.retrieve({ database_id: dbId });
        
        const properties = Object.keys(database.properties);
        const requiredProps = getRequiredProperties(dbName);
        const missingProps = requiredProps.filter(prop => !properties.includes(prop));
        
        if (missingProps.length > 0) {
          result.errors.push(`❌ ${dbName} missing properties: ${missingProps.join(", ")}`);
          result.success = false;
        } else {
          console.log(`✅ ${dbName} has all required properties`);
        }
      } catch (error) {
        result.errors.push(`❌ Failed to validate ${dbName}: ${error}`);
        result.success = false;
      }
    }
  }

  const requiredPages = ["Home — Today", "Writing Scene", "Editing Scene", "Admin Scene", "Review"];
  if (state.pages) {
    const missingPages = requiredPages.filter(pageName => !state.pages[pageName]);
    if (missingPages.length > 0) {
      result.errors.push(`❌ Missing scaffold pages: ${missingPages.join(", ")}`);
      result.success = false;
    } else {
      console.log("✅ All scaffold pages found");
    }
  } else {
    result.warnings.push("⚠️  No pages found in state - scaffold pages may not be created");
  }

  result.warnings.push("⚠️  Manual verification needed for saved views on Home — Today (Now, Next, Shelf, Resurface Lane)");
  result.warnings.push("⚠️  Manual verification needed for Buttons on Inbox and Review pages");
  result.warnings.push("⚠️  Manual verification needed for filtered views on Scene pages");

  return result;
}

function getRequiredProperties(dbName: string): string[] {
  const propertyMap: Record<string, string[]> = {
    "Inbox": ["Name", "Type", "File", "URL", "Next Tiny Step", "Project", "People", "Resurface On", "Pinned", "Created"],
    "Tasks": ["Name", "Project", "Status", "Priority", "Effort (hrs)", "Due", "Scene", "If", "Then", "At", "Implementation Intent", "Timebox (min)", "Resurface On", "Pinned", "Completed On"],
    "Projects": ["Name", "Goal", "Status", "Due", "Scene Default", "Tasks", "Notes", "Assets", "People", "Progress %", "Next Review", "Pinned"],
    "Notes": ["Name", "Project", "Type", "Source URL", "Excerpt", "Resurface On", "Tags", "Assets", "Created"],
    "Assets": ["Name", "Files", "Type", "Project", "Source URL", "Pinned", "Added", "Tags"],
    "People": ["Name", "Role", "Email", "Notes", "Projects"]
  };
  return propertyMap[dbName] || [];
}

async function main() {
  try {
    const result = await validateNightDesk();
    
    console.log("\n📊 Validation Results:");
    console.log("=".repeat(50));
    
    if (result.errors.length > 0) {
      console.log("\n🚨 ERRORS:");
      result.errors.forEach(error => console.log(error));
    }
    
    if (result.warnings.length > 0) {
      console.log("\n⚠️  WARNINGS:");
      result.warnings.forEach(warning => console.log(warning));
    }
    
    if (result.success) {
      console.log("\n🎉 Validation passed! Night Desk template is properly configured.");
      console.log("\nManual verification still needed for:");
      console.log("- Saved views on Home — Today page");
      console.log("- Buttons on Inbox and Review pages");
      console.log("- Filtered views on Scene pages");
      process.exit(0);
    } else {
      console.log(`\n❌ Validation failed with ${result.errors.length} error(s).`);
      console.log("Run the suggested commands to fix issues and try again.");
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Validation script failed:", error);
    process.exit(1);
  }
}

main();
