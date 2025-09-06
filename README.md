# notion-builds (monorepo)

This repo programmatically creates Notion databases and scaffold pages for templates like **Night Desk**.

## Quick start

1) Install deps
```bash
npm i
# or: pnpm i
```

2) Set up environment
```bash
cp .env.sample .env
# Edit .env with your Notion token and parent page ID
```

3) Build Night Desk template
```bash
npm run build:night-desk
```

## Templates

### Night Desk
A GTD-inspired productivity system with 6 databases:
- **Inbox** - Quick capture for ideas, tasks, notes, assets
- **Tasks** - Action items with GTD contexts and time boxing
- **Projects** - Higher-level outcomes and areas
- **Notes** - Ideas, references, drafts
- **Assets** - Files, images, B-roll (the "Shelf")
- **People** - Contacts and collaborators

Creates a "Home — Today" page with sections for Now/Next/Shelf/Resurface Lane.

## Architecture

- `packages/core/` - Shared Notion API helpers
- `templates/*/` - Template-specific builders and configs
- `scripts/` - Utility scripts for seeding, etc.
- `assets/` - Static files (screenshots, etc.)

## Development

Each template has:
- `manifest.json` - Metadata about databases to create
- `create.ts` - Builder script that creates databases and scaffold pages
- `seed.json` - Optional sample data

Run `tsx templates/<name>/create.ts` to build a template.