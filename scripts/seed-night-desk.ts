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
      "Pinned": { checkbox: true },
      "Demo": { checkbox: true }
    }
  });

  const project2 = await notion.pages.create({
    parent: { database_id: projectsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "YouTube Pipeline" } }] },
      "Goal": { rich_text: [{ type: "text", text: { content: "Streamline video content creation workflow" } }] },
      "Status": { select: { name: "Active" } },
      "Scene Default": { select: { name: "Editing" } },
      "Demo": { checkbox: true }
    }
  });

  const project3 = await notion.pages.create({
    parent: { database_id: projectsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Admin Cleanup" } }] },
      "Goal": { rich_text: [{ type: "text", text: { content: "Organize and clean up administrative tasks" } }] },
      "Status": { select: { name: "On Hold" } },
      "Scene Default": { select: { name: "Admin" } },
      "Demo": { checkbox: true }
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
      "Projects": { relation: [{ id: (project1 as any).id }] },
      "Demo": { checkbox: true }
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
      "At": { rich_text: [{ type: "text", text: { content: "my writing desk with coffee" } }] },
      "Demo": { checkbox: true }
    }
  });

  await notion.pages.create({
    parent: { database_id: tasksDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Create Shelf gallery view" } }] },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Status": { select: { name: "Next" } },
      "Priority": { select: { name: "Med" } },
      "Scene": { select: { name: "Editing" } },
      "Demo": { checkbox: true }
    }
  });

  await notion.pages.create({
    parent: { database_id: tasksDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Add Resurface buttons" } }] },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Status": { select: { name: "Next" } },
      "Priority": { select: { name: "Med" } },
      "Scene": { select: { name: "Admin" } },
      "Demo": { checkbox: true }
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
      "Tags": { multi_select: [{ name: "ADHD" }, { name: "productivity" }] },
      "Demo": { checkbox: true }
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
      "Tags": { multi_select: [{ name: "design" }, { name: "dark-theme" }] },
      "Demo": { checkbox: true }
    }
  });

  await notion.pages.create({
    parent: { database_id: assetsDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Demo video B-roll" } }] },
      "Type": { select: { name: "B-roll" } },
      "Project": { relation: [{ id: (project2 as any).id }] },
      "Source URL": { url: "https://example.com/broll.mp4" },
      "Tags": { multi_select: [{ name: "video" }, { name: "demo" }] },
      "Demo": { checkbox: true }
    }
  });

  const inboxDbId = state.databases["Inbox"];
  await notion.pages.create({
    parent: { database_id: inboxDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Research ADHD productivity methods" } }] },
      "Type": { select: { name: "Idea" } },
      "Next Tiny Step": { rich_text: [{ type: "text", text: { content: "Find 3 research papers on ADHD and productivity" } }] },
      "Project": { relation: [{ id: (project1 as any).id }] },
      "Demo": { checkbox: true }
    }
  });

  await notion.pages.create({
    parent: { database_id: inboxDbId },
    properties: {
      "Name": { title: [{ type: "text", text: { content: "Update social media bio" } }] },
      "Type": { select: { name: "Task" } },
      "Next Tiny Step": { rich_text: [{ type: "text", text: { content: "Draft new bio mentioning Night Desk template" } }] },
      "Demo": { checkbox: true }
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
  console.log("- 2 Inbox items for capture workflow demo");
  console.log("\nAll relations are properly linked between databases.");
}

seedNightDesk().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
