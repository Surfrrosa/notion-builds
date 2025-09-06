import { notion } from "../../packages/core/notion.js";
import { createOrUpdateDatabase, titleProp, selectProp, numberProp, dateProp, richTextProp, checkboxProp, filesProp, urlProp } from "../../packages/core/schema.js";
import manifest from "./manifest.json" assert { type: "json" };

async function createScaffoldPages() {
  const home = await notion.pages.create({
    parent: { type: "page_id", page_id: process.env.PARENT_PAGE_ID! },
    icon: { type: "emoji", emoji: "🌚" },
    properties: { title: [{ type: "text", text: { content: "Home — Today" } }] }
  });
  // Add headings for sections (linked DB views will be added manually in Notion UI)
  await notion.blocks.children.append({
    block_id: (home as any).id,
    children: [
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Now" } }] } },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Next" } }] } },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Shelf" } }] } },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Resurface Lane" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Add linked DB views under each heading." } }] } }
    ]
  });
  return home;
}

async function main() {
  if (!process.env.NOTION_TOKEN || !process.env.PARENT_PAGE_ID) {
    throw new Error("Set NOTION_TOKEN and PARENT_PAGE_ID in .env");
  }

  // 1) Inbox (quick capture)
  await createOrUpdateDatabase({
    title: "Inbox",
    icon: { emoji: "📥" },
    properties: {
      "Name": titleProp,
      "Type": selectProp(["Idea","Task","Note","Asset","Link"].map(n=>({name:n}))),
      "File": filesProp,
      "URL": urlProp,
      "Next Tiny Step": richTextProp,
      "Resurface On": dateProp,
      "Pinned": checkboxProp
    }
  });

  // 2) Tasks (example properties; Devin will add relations/formulas)
  await createOrUpdateDatabase({
    title: "Tasks",
    icon: { emoji: "✅" },
    properties: {
      "Name": titleProp,
      "Status": selectProp(["Now","Next","Scheduled","Waiting","Done"].map(n=>({name:n}))),
      "Priority": selectProp(["Low","Med","High"].map(n=>({name:n}))),
      "Effort (hrs)": numberProp,
      "Due": dateProp,
      "Scene": selectProp(["Writing","Editing","Admin","Deep Work"].map(n=>({name:n}))),
      "If": richTextProp,
      "Then": richTextProp,
      "At": richTextProp,
      "Timebox (min)": numberProp,
      "Resurface On": dateProp,
      "Pinned": checkboxProp,
      "Completed On": dateProp
    }
  });

  // 3) Projects
  await createOrUpdateDatabase({
    title: "Projects",
    icon: { emoji: "📁" },
    properties: {
      "Name": titleProp,
      "Status": selectProp(["Active","On Hold","Someday","Done"].map(n=>({name:n}))),
      "Due": dateProp,
      "Pinned": checkboxProp
    }
  });

  // 4) Notes
  await createOrUpdateDatabase({
    title: "Notes",
    icon: { emoji: "🗒️" },
    properties: {
      "Name": titleProp,
      "Type": selectProp(["Idea","Reference","Draft"].map(n=>({name:n}))),
      "Source URL": urlProp,
      "Excerpt": richTextProp,
      "Resurface On": dateProp
    }
  });

  // 5) Assets (the "Shelf")
  await createOrUpdateDatabase({
    title: "Assets",
    icon: { emoji: "🗃️" },
    properties: {
      "Name": titleProp,
      "Files": filesProp,
      "Type": selectProp(["Image","Video","Audio","Doc","Thumb","B-roll"].map(n=>({name:n}))),
      "Source URL": urlProp,
      "Pinned": checkboxProp
    }
  });

  // 6) People
  await createOrUpdateDatabase({
    title: "People",
    icon: { emoji: "👥" },
    properties: {
      "Name": titleProp,
      "Role": selectProp(["Collaborator","Client","Body-Double","Friend"].map(n=>({name:n}))),
      "Contact": urlProp // can swap to email text if preferred
    }
  });

  await createScaffoldPages();

  console.log("✅ Night Desk scaffold created. Next: add linked views + buttons in Notion UI.");
}

main().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});