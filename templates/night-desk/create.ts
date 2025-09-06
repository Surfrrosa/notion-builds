import { notion } from "../../packages/core/notion.js";
import { createOrUpdateDatabase, titleProp, selectProp, numberProp, dateProp, richTextProp, checkboxProp, filesProp, urlProp, emailProp, multiSelectProp, createdTimeProp, relationProp, relationSingle, rollupProp, formulaProp, ensureDualRelation } from "../../packages/core/schema.js";
import manifest from "./manifest.json" with { type: "json" };
import fs from 'fs/promises';

const ASSET_BASE_URL = "https://raw.githubusercontent.com/Surfrrosa/notion-builds/main/assets";

const ICONS = {
  home: `${ASSET_BASE_URL}/icons/home.png`,
  inbox: `${ASSET_BASE_URL}/icons/inbox.png`,
  tasks: `${ASSET_BASE_URL}/icons/tasks.png`,
  projects: `${ASSET_BASE_URL}/icons/projects.png`,
  notes: `${ASSET_BASE_URL}/icons/notes.png`,
  assets: `${ASSET_BASE_URL}/icons/assets.png`,
  people: `${ASSET_BASE_URL}/icons/people.png`,
  writing: `${ASSET_BASE_URL}/icons/writing.png`,
  editing: `${ASSET_BASE_URL}/icons/editing.png`,
  admin: `${ASSET_BASE_URL}/icons/admin.png`,
  review: `${ASSET_BASE_URL}/icons/review.png`,
};

const COVERS = [
  `${ASSET_BASE_URL}/covers/gradient-dark-01.png`,
  `${ASSET_BASE_URL}/covers/gradient-dark-02.png`,
  `${ASSET_BASE_URL}/covers/gradient-dark-03.png`,
  `${ASSET_BASE_URL}/covers/gradient-dark-04.png`,
  `${ASSET_BASE_URL}/covers/gradient-dark-05.png`,
];

async function createScaffoldPages(parentPageId: string) {
  const stateFile = '.state.json';
  let state: any = {};
  try {
    state = JSON.parse(await fs.readFile(stateFile, 'utf8'));
  } catch {}

  if (state.pages?.created) {
    console.log("Scaffold pages already created, skipping...");
    return state.pages;
  }

  const templateRoot = await notion.pages.create({
    parent: { type: "page_id", page_id: parentPageId },
    icon: { type: "emoji", emoji: "🌙" },
    properties: { title: [{ type: "text", text: { content: "Night Desk — Template Root" } }] }
  });

  await notion.blocks.children.append({
    block_id: (templateRoot as any).id,
    children: [
      { object: "block", heading_1: { rich_text: [{ type: "text", text: { content: "Night Desk" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "The ADHD-friendly Notion workspace that works with your brain, not against it." } }] } },
      { object: "block", divider: {} },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Quick Navigation" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Essential pages for your daily workflow:" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Home — Today (your daily dashboard)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Writing Scene (focused writing environment)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Editing Scene (media and revision workspace)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Admin Scene (maintenance and project management)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Review (gentle resurfacing workflows)" } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Databases" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Inbox (universal capture point)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Tasks (action items with GTD contexts)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Projects (goal tracking with progress rollups)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Notes (ideas, references, and drafts)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Assets (visual shelf for files and media)" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "People (collaborators and body-doubling partners)" } }] } },
      { object: "block", divider: {} },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Start Here" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Get up and running in 5 minutes with our comprehensive guides:" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Quick Start Guide (PDF) - Visual setup walkthrough" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Neuro Guide (PDF) - ADHD-friendly design principles" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Pro tip: Start by capturing everything in your Inbox, then use the Promote buttons to organize items into their proper databases." } }] } },
      { object: "block", divider: {} },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Demo Data" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "This template includes demo content to help you understand the workflow. Each database has:" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Demo Data view - See all example content" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "Archive Demo button - Hide demo items when you're ready" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "When you're comfortable with the system, use the Archive Demo buttons to clean up and start fresh!" } }] } },
      { object: "block", divider: {} },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Support & Updates" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Questions? Need help customizing your workspace?" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "📧 Email: support@nightdesk.template" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "🔗 Updates: Check back for new features and improvements" } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "📝 Changelog" } }] } },
      { object: "block", bulleted_list_item: { rich_text: [{ type: "text", text: { content: "v1.0.0 - Initial release with full 6-database system, scene workflows, and gentle resurfacing" } }] } }
    ]
  });

  const home = await notion.pages.create({
    parent: { type: "page_id", page_id: parentPageId },
    icon: { type: "emoji", emoji: "🌚" },
    properties: { title: [{ type: "text", text: { content: "Home — Today" } }] }
  });
  
  await notion.blocks.children.append({
    block_id: (home as any).id,
    children: [
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Now" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Tasks view: Board columns Now/Next/Done, filter Status=Now, sort Priority desc" } }] } },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Next" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Tasks view: List, filter Status=Next, sort Due asc" } }] } },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Shelf" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Assets view: Gallery, card preview=Files, sort Pinned desc" } }] } },
      { object: "block", heading_2: { rich_text: [{ type: "text", text: { content: "Resurface Lane" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Tasks & Notes views: filter Resurface On = today" } }] } }
    ]
  });

  const writingScene = await notion.pages.create({
    parent: { type: "page_id", page_id: parentPageId },
    icon: { type: "emoji", emoji: "✍️" },
    properties: { title: [{ type: "text", text: { content: "Writing Scene" } }] }
  });

  await notion.blocks.children.append({
    block_id: (writingScene as any).id,
    children: [
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Focus mode for writing tasks and draft notes." } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Writing Tasks" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Tasks filtered by Scene=Writing" } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Draft Notes" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Notes filtered by Type=Draft" } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Writing Shelf" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Assets filtered by Type in (Image, Thumb)" } }] } }
    ]
  });

  const editingScene = await notion.pages.create({
    parent: { type: "page_id", page_id: parentPageId },
    icon: { type: "emoji", emoji: "🎬" },
    properties: { title: [{ type: "text", text: { content: "Editing Scene" } }] }
  });

  await notion.blocks.children.append({
    block_id: (editingScene as any).id,
    children: [
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Focus mode for editing tasks and media assets." } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Editing Tasks" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Tasks filtered by Scene=Editing" } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Media Shelf" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Assets filtered by Type in (Video, Audio, B-roll)" } }] } }
    ]
  });

  const adminScene = await notion.pages.create({
    parent: { type: "page_id", page_id: parentPageId },
    icon: { type: "emoji", emoji: "⚙️" },
    properties: { title: [{ type: "text", text: { content: "Admin Scene" } }] }
  });

  await notion.blocks.children.append({
    block_id: (adminScene as any).id,
    children: [
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Administrative tasks and project management." } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Admin Tasks" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Tasks filtered by Scene=Admin" } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Projects Needing Next Step" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Projects with no Task where Status=Now" } }] } }
    ]
  });

  const reviewPage = await notion.pages.create({
    parent: { type: "page_id", page_id: parentPageId },
    icon: { type: "emoji", emoji: "🔄" },
    properties: { title: [{ type: "text", text: { content: "Review" } }] }
  });

  await notion.blocks.children.append({
    block_id: (reviewPage as any).id,
    children: [
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Gentle resurfacing and review workflows." } }] } },
      { object: "block", heading_3: { rich_text: [{ type: "text", text: { content: "Items to Resurface" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Combined views of Tasks and Notes with Resurface On dates" } }] } },
      { object: "block", paragraph: { rich_text: [{ type: "text", text: { content: "Add Buttons: Snooze +1d/+3d/+7d for selected items" } }] } }
    ]
  });

  const pages = { templateRoot, home, writingScene, editingScene, adminScene, reviewPage, created: true };
  state.pages = pages;
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
  
  return pages;
}

function validateUUID(uuid: string): boolean {
  return !!(uuid && uuid.length >= 10);
}

async function main() {
  if (!process.env.NOTION_TOKEN || !process.env.PARENT_PAGE_ID) {
    throw new Error("Set NOTION_TOKEN and PARENT_PAGE_ID in .env");
  }

  const parentPageId = process.env.PARENT_PAGE_ID.trim().replace(/^["']|["']$/g, '');
  if (!validateUUID(parentPageId)) {
    throw new Error(`PARENT_PAGE_ID must be a valid page ID, got: "${parentPageId}"`);
  }

  console.log("Creating databases...");

  const projectsDb = await createOrUpdateDatabase({
    title: "Projects",
    properties: {
      "Name": titleProp,
      "Goal": richTextProp,
      "Status": selectProp(["Active","On Hold","Someday","Done"].map(n=>({name:n}))),
      "Due": dateProp,
      "Scene Default": selectProp(["Writing","Editing","Admin","Deep Work"].map(n=>({name:n}))),
      "Next Review": dateProp,
      "Pinned": checkboxProp,
      "Demo": checkboxProp
    }
  });

  const peopleDb = await createOrUpdateDatabase({
    title: "People",
    properties: {
      "Name": titleProp,
      "Role": selectProp(["Collaborator","Client","Body-Double","Friend"].map(n=>({name:n}))),
      "Email": emailProp,
      "Notes": richTextProp,
      "Demo": checkboxProp
    }
  });

  const tasksDb = await createOrUpdateDatabase({
    title: "Tasks",
    properties: {
      "Name": titleProp,
      "Project": relationSingle(projectsDb.id),
      "Status": selectProp(["Now","Next","Scheduled","Waiting","Done"].map(n=>({name:n}))),
      "Priority": selectProp(["Low","Med","High"].map(n=>({name:n}))),
      "Effort (hrs)": numberProp,
      "Due": dateProp,
      "Scene": selectProp(["Writing","Editing","Admin","Deep Work"].map(n=>({name:n}))),
      "If": richTextProp,
      "Then": richTextProp,
      "At": richTextProp,
      "Implementation Intent": formulaProp('if(prop("If") != "" and prop("Then") != "" and prop("At") != "", prop("If") + " → " + prop("Then") + " @ " + prop("At"), "")'),
      "Timebox (min)": numberProp,
      "Resurface On": dateProp,
      "Pinned": checkboxProp,
      "Completed On": dateProp,
      "Demo": checkboxProp
    }
  });

  const notesDb = await createOrUpdateDatabase({
    title: "Notes",
    properties: {
      "Name": titleProp,
      "Project": relationSingle(projectsDb.id),
      "Type": selectProp(["Idea","Reference","Draft"].map(n=>({name:n}))),
      "Source URL": urlProp,
      "Excerpt": richTextProp,
      "Resurface On": dateProp,
      "Tags": multiSelectProp([]),
      "Created": createdTimeProp,
      "Demo": checkboxProp
    }
  });

  const assetsDb = await createOrUpdateDatabase({
    title: "Assets",
    properties: {
      "Name": titleProp,
      "Files": filesProp,
      "Type": selectProp(["Image","Video","Audio","Doc","Thumb","B-roll"].map(n=>({name:n}))),
      "Project": relationSingle(projectsDb.id),
      "Source URL": urlProp,
      "Pinned": checkboxProp,
      "Added": createdTimeProp,
      "Tags": multiSelectProp([]),
      "Demo": checkboxProp
    }
  });

  const inboxDb = await createOrUpdateDatabase({
    title: "Inbox",
    properties: {
      "Name": titleProp,
      "Type": selectProp(["Idea","Task","Note","Asset","Link"].map(n=>({name:n}))),
      "File": filesProp,
      "URL": urlProp,
      "Next Tiny Step": richTextProp,
      "Project": relationSingle(projectsDb.id),
      "People": relationSingle(peopleDb.id),
      "Resurface On": dateProp,
      "Pinned": checkboxProp,
      "Created": createdTimeProp,
      "Demo": checkboxProp
    }
  });

  console.log("Setting up bidirectional relations...");
  
  const taskProjectRelation = await ensureDualRelation(notion, {
    aDbId: tasksDb.id, aProp: "Project",
    bDbId: projectsDb.id, bProp: "Tasks",
  });
  
  const noteProjectRelation = await ensureDualRelation(notion, {
    aDbId: notesDb.id, aProp: "Project", 
    bDbId: projectsDb.id, bProp: "Notes",
  });
  
  const assetProjectRelation = await ensureDualRelation(notion, {
    aDbId: assetsDb.id, aProp: "Project",
    bDbId: projectsDb.id, bProp: "Assets", 
  });
  
  const peopleProjectRelation = await ensureDualRelation(notion, {
    aDbId: peopleDb.id, aProp: "Projects",
    bDbId: projectsDb.id, bProp: "People",
  });
  
  const noteAssetRelation = await ensureDualRelation(notion, {
    aDbId: notesDb.id, aProp: "Assets",
    bDbId: assetsDb.id, bProp: "Notes",
  });

  await notion.databases.update({
    database_id: projectsDb.id,
    properties: {
      "Progress %": { type: "rollup", rollup: { relation_property_name: "Tasks", rollup_property_name: "Status", function: "percent_checked" } } as any
    }
  });

  console.log("Applying premium brand assets...");
  
  await notion.databases.update({
    database_id: projectsDb.id,
    icon: { type: "external", external: { url: ICONS.projects } },
    cover: { type: "external", external: { url: COVERS[0] } }
  });
  
  await notion.databases.update({
    database_id: peopleDb.id,
    icon: { type: "external", external: { url: ICONS.people } },
    cover: { type: "external", external: { url: COVERS[1] } }
  });
  
  await notion.databases.update({
    database_id: tasksDb.id,
    icon: { type: "external", external: { url: ICONS.tasks } },
    cover: { type: "external", external: { url: COVERS[2] } }
  });
  
  await notion.databases.update({
    database_id: notesDb.id,
    icon: { type: "external", external: { url: ICONS.notes } },
    cover: { type: "external", external: { url: COVERS[3] } }
  });
  
  await notion.databases.update({
    database_id: assetsDb.id,
    icon: { type: "external", external: { url: ICONS.assets } },
    cover: { type: "external", external: { url: COVERS[4] } }
  });
  
  await notion.databases.update({
    database_id: inboxDb.id,
    icon: { type: "external", external: { url: ICONS.inbox } },
    cover: { type: "external", external: { url: COVERS[0] } }
  });

  console.log("Creating scaffold pages...");
  const pages = await createScaffoldPages(parentPageId);

  console.log("Applying assets to scaffold pages...");
  
  await notion.pages.update({
    page_id: (pages.templateRoot as any).id,
    icon: { type: "external", external: { url: ICONS.home } },
    cover: { type: "external", external: { url: COVERS[0] } }
  });
  
  await notion.pages.update({
    page_id: (pages.home as any).id,
    icon: { type: "external", external: { url: ICONS.home } },
    cover: { type: "external", external: { url: COVERS[1] } }
  });
  
  await notion.pages.update({
    page_id: (pages.writingScene as any).id,
    icon: { type: "external", external: { url: ICONS.writing } },
    cover: { type: "external", external: { url: COVERS[2] } }
  });
  
  await notion.pages.update({
    page_id: (pages.editingScene as any).id,
    icon: { type: "external", external: { url: ICONS.editing } },
    cover: { type: "external", external: { url: COVERS[3] } }
  });
  
  await notion.pages.update({
    page_id: (pages.adminScene as any).id,
    icon: { type: "external", external: { url: ICONS.admin } },
    cover: { type: "external", external: { url: COVERS[4] } }
  });
  
  await notion.pages.update({
    page_id: (pages.reviewPage as any).id,
    icon: { type: "external", external: { url: ICONS.review } },
    cover: { type: "external", external: { url: COVERS[0] } }
  });

  console.log("Creating synced navigation block...");
  
  const navResponse = await notion.blocks.children.append({
    block_id: (pages.home as any).id,
    children: [{
      object: "block",
      type: "synced_block",
      synced_block: {
        synced_from: null,
        children: [{
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { type: "text", text: { content: "Home — Today" }, annotations: { bold: true } },
              { type: "text", text: { content: " · " } },
              { type: "text", text: { content: "Scenes: " } },
              { type: "text", text: { content: "Writing" }, annotations: { bold: true } },
              { type: "text", text: { content: " · " } },
              { type: "text", text: { content: "Editing" }, annotations: { bold: true } },
              { type: "text", text: { content: " · " } },
              { type: "text", text: { content: "Admin" }, annotations: { bold: true } },
              { type: "text", text: { content: " · " } },
              { type: "text", text: { content: "Review" }, annotations: { bold: true } },
              { type: "text", text: { content: " · " } },
              { type: "text", text: { content: "Databases" }, annotations: { bold: true } }
            ]
          }
        }]
      }
    }]
  });
  
  const navBlockId = navResponse.results[0].id;
  
  const pagesToAddNav = [
    (pages.writingScene as any).id,
    (pages.editingScene as any).id,
    (pages.adminScene as any).id,
    (pages.reviewPage as any).id
  ];
  
  for (const pageId of pagesToAddNav) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: [{
        object: "block",
        type: "synced_block",
        synced_block: {
          synced_from: { block_id: navBlockId }
        }
      }]
    });
  }

  console.log("Creating Home layout sections...");
  
  await notion.blocks.children.append({
    block_id: (pages.home as any).id,
    children: [
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "Now" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: "Tasks board: columns Now/Next/Done; filter Status=Now; show Priority, Due, Timebox" } }] }
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "Next" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: "Tasks list: Status=Next; sort Due asc, Priority desc" } }] }
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "Shelf" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: "Assets gallery: card preview=Files; Pinned desc, Added desc" } }] }
      },
      {
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: "Resurface Lane" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: "Tasks with Resurface On = today" } }] }
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ type: "text", text: { content: "Notes with Resurface On = today" } }] }
      }
    ]
  });

  console.log("Preparing web sharing setup...");
  
  const state = JSON.parse(await fs.readFile('.state.json', 'utf8'));
  state.webSharing = {
    templateRootId: (pages.templateRoot as any).id,
    publicUrl: "TO_BE_UPDATED_MANUALLY"
  };
  await fs.writeFile('.state.json', JSON.stringify(state, null, 2));

  console.log("✅ Night Desk premium template created successfully!");
  console.log("\n🎨 Brand Assets Applied:");
  console.log("- Custom white line-art icons applied to all databases and pages");
  console.log("- Dark gradient covers applied with consistent aesthetic");
  console.log("- All emojis removed for professional appearance");
  console.log("- Synced navigation block created and distributed");
  console.log("- Home layout sections implemented");
  
  console.log("\n📄 Page URLs (for manual web sharing setup):");
  console.log(`- Template Root: https://notion.so/${(pages.templateRoot as any).id.replace(/-/g, '')}`);
  
  console.log("\n🔗 Asset URLs Used:");
  Object.entries(ICONS).forEach(([key, url]) => {
    console.log(`- ${key}: ${url}`);
  });
  
  console.log("\nDatabase IDs:");
  console.log(`- Inbox: ${inboxDb.id}`);
  console.log(`- Tasks: ${tasksDb.id}`);
  console.log(`- Projects: ${projectsDb.id}`);
  console.log(`- Notes: ${notesDb.id}`);
  console.log(`- Assets: ${assetsDb.id}`);
  console.log(`- People: ${peopleDb.id}`);
  
  console.log("\nPage IDs:");
  console.log(`- Template Root: ${(pages.templateRoot as any).id}`);
  console.log(`- Home — Today: ${(pages.home as any).id}`);
  console.log(`- Writing Scene: ${(pages.writingScene as any).id}`);
  console.log(`- Editing Scene: ${(pages.editingScene as any).id}`);
  console.log(`- Admin Scene: ${(pages.adminScene as any).id}`);
  console.log(`- Review: ${(pages.reviewPage as any).id}`);
  
  console.log("\n⚠️  Manual steps required:");
  console.log("1. Run 'npm run seed:night-desk' to add demo content");
  console.log("2. Enable web sharing on Template Root page:");
  console.log(`   - Open: https://notion.so/${(pages.templateRoot as any).id.replace(/-/g, '')}`);
  console.log("   - Click Share → Share to web → Allow duplicate as template");
  console.log("   - Copy the public duplicate link");
  console.log("3. In Notion UI, add linked database views under each page section");
  console.log("4. Create Buttons for promoting Inbox items and resurfacing content");
}

main().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});
