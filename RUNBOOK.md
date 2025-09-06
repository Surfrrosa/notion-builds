# Night Desk Template Runbook

## Setup Instructions

1. **Environment Setup**
   ```bash
   cp .env.sample .env
   # Edit .env with your Notion credentials
   ```

2. **Get Notion Integration Token**
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the "Internal Integration Token" to NOTION_TOKEN in .env

3. **Get Parent Page ID**
   - Create or navigate to your Notion workspace page
   - Share the page with your integration (Add connections → Your integration name)
   - Copy the page ID from the URL (the long string after the last slash)
   - Add it as PARENT_PAGE_ID in .env

## Build Commands

### Create Template Structure
```bash
npm run build:night-desk
```
This creates:
- 6 databases with complete schemas and relations
- Scaffold pages (Home—Today, Scenes, Review)
- Saves state in .state.json for idempotency

### Seed Demo Content
```bash
npm run seed:night-desk
```
This adds:
- 3 sample projects with different statuses
- 3 tasks linked to projects with implementation intents
- 1 draft note with tags
- 2 assets with different types
- 1 body-double contact
- All relations properly linked

## Template Structure

### Databases
- **Inbox** 📥 - Quick capture with promotion workflow
- **Tasks** ✅ - GTD-style task management with scenes
- **Projects** 📁 - Project containers with progress tracking
- **Notes** 🗒️ - Knowledge management with resurfacing
- **Assets** 🗃️ - Media shelf with tagging
- **People** 👥 - Contacts and collaborators

### Pages
- **Home — Today** 🌚 - Daily dashboard with Now/Next/Shelf/Resurface sections
- **Writing Scene** ✍️ - Focus mode for writing tasks and drafts
- **Editing Scene** 🎬 - Media editing workspace
- **Admin Scene** ⚙️ - Administrative task management
- **Review** 🔄 - Gentle resurfacing and review workflows

## Manual Setup Required

After running the build commands, you'll need to manually add in Notion:

1. **Linked Database Views** under each page section
2. **Buttons** for:
   - Promoting Inbox items to Tasks/Notes/Assets
   - Resurfacing content (+1d/+3d/+7d)
3. **Saved Views** with proper filters and sorting

## Key Features

- **Implementation Intent Formula**: Combines If/Then/At fields for better task clarity
- **Progress Tracking**: Rollup formula showing project completion percentage
- **Gentle Resurfacing**: Date-based content resurfacing system
- **Scene-Based Workflow**: Context switching for different work modes
- **ADHD-Friendly**: Minimal cognitive load with clear visual hierarchy

## Idempotency

Both commands are idempotent:
- Running `build:night-desk` multiple times won't create duplicates
- Running `seed:night-desk` multiple times won't add duplicate content
- State is tracked in `.state.json`

## Troubleshooting

- **"Database already exists"**: Normal behavior, idempotency working
- **"Demo content already seeded"**: Normal behavior, run once only
- **Missing relations**: Check that all databases were created successfully
- **Formula errors**: Verify Notion API supports the formula syntax used
