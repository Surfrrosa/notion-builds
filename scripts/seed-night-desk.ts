import 'dotenv/config';
import { notion } from "../packages/core/notion.js";
import { readFile, writeFile } from 'fs/promises';

async function seedNightDesk() {
  const stateFile = '.state.json';
  let state: any = {};
  try {
    state = JSON.parse(await readFile(stateFile, 'utf8'));
  } catch {
    console.error("No .state.json found. Run 'npm run build:night-desk' first.");
    process.exit(1);
  }

  if (state.seeded) {
    console.log("Demo content already seeded, skipping...");
    return;
  }

  if (!state.databases) {
    console.error("No databases found in state. Run 'npm run build:night-desk' first.");
    process.exit(1);
  }

  console.log("Seeding demo content...");

  const projectsDbId = state.databases["Projects"];
  const project1 = await notion.pages.create({
    parent: { database_id: projectsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "ND — Launch v1" } }] },
      "Goal": { rich_text: [{ type: "text", text: { content: "Launch the Night Desk template with full functionality" } }] },
      "Status": { select: { name: "Active" } },
      "Scene Default": { select: { name: "Writing" } },
      "Pinned": { checkbox: true }
    }
  });

  const project2 = await notion.pages.create({
    parent: { database_id: projectsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "YouTube Pipeline" } }] },
      "Goal": { rich_text: [{ type: "text", text: { content: "Streamline video content creation workflow" } }] },
      "Status": { select: { name: "Active" } },
      "Scene Default": { select: { name: "Editing" } }
    }
  });

  const project3 = await notion.pages.create({
    parent: { database_id: projectsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Admin Cleanup" } }] },
      "Goal": { rich_text: [{ type: "text", text: { content: "Organize and clean up administrative tasks" } }] },
      "Status": { select: { name: "On Hold" } },
      "Scene Default": { select: { name: "Admin" } }
    }
  });

  const peopleDbId = state.databases["People"];
  const person1 = await notion.pages.create({
    parent: { database_id: peopleDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Body Double — Alex" } }] },
      "Role": { select: { name: "Body-Double" } },
      "Email": { email: "alex@example.com" },
      "Notes": { rich_text: [{ type: "text", text: { content: "Available weekday mornings for co-working sessions" } }] },
      "Projects": { relation: [{ id: (project1 as any).id }] }
    }
  });

  const tasksDbId = state.databases["Tasks"];
  await notion.pages.create({
    parent: { database_id: tasksDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Write Quick Start (5 min)" } }] },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Status": { select: { name: "Now" } },
      "Priority": { select: { name: "High" } },
      "Scene": { select: { name: "Writing" } },
      "Timebox (min)": { number: 25 },
      "If": { rich_text: [{ type: "text", text: { content: "I sit down to write" } }] },
      "Then": { rich_text: [{ type: "text", text: { content: "I'll draft the quick start guide" } }] },
      "At": { rich_text: [{ type: "text", text: { content: "my writing desk with coffee" } }] }
    }
  });

  await notion.pages.create({
    parent: { database_id: tasksDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Create Shelf gallery view" } }] },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Status": { select: { name: "Next" } },
      "Priority": { select: { name: "Med" } },
      "Scene": { select: { name: "Editing" } }
    }
  });

  await notion.pages.create({
    parent: { database_id: tasksDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Add Resurface buttons" } }] },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Status": { select: { name: "Next" } },
      "Priority": { select: { name: "Med" } },
      "Scene": { select: { name: "Admin" } }
    }
  });

  const notesDbId = state.databases["Notes"];
  await notion.pages.create({
    parent: { database_id: notesDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Draft — Neuro guide outline" } }] },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Type": { select: { name: "Draft" } },
      "Excerpt": { rich_text: [{ type: "text", text: { content: "ADHD-friendly productivity system outline with focus on gentle resurfacing" } }] },
      "Tags": { multi_select: [{ name: "ADHD" }, { name: "productivity" }] }
    }
  });

  const assetsDbId = state.databases["Assets"];
  await notion.pages.create({
    parent: { database_id: assetsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Dark theme mockup" } }] },
      "Type": { select: { name: "Image" } },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Source URL": { url: "https://example.com/mockup.png" },
      "Pinned": { checkbox: true },
      "Tags": { multi_select: [{ name: "design" }, { name: "dark-theme" }] }
    }
  });

  await notion.pages.create({
    parent: { database_id: assetsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Demo video B-roll" } }] },
      "Type": { select: { name: "B-roll" } },
      "Project": { relation: [{ id: (project2 as any).id }] },
      "Source URL": { url: "https://example.com/broll.mp4" },
      "Tags": { multi_select: [{ name: "video" }, { name: "demo" }] }
    }
  });

  state.seeded = true;
  await writeFile(stateFile, JSON.stringify(state, null, 2));
  
  console.log("✅ Demo content seeded successfully!");
  console.log("- 3 Projects created with different statuses");
  console.log("- 1 Body-double contact added");
  console.log("- 3 Tasks linked to ND Launch project");
  console.log("- 1 Draft note with tags");
  console.log("- 2 Assets with different types");
  console.log("\nAll relations are properly linked between databases.");
}

seedNightDesk().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
