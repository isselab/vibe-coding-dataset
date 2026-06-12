# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build to dist/
npm run preview   # Serve the production build locally
```

No test runner is configured in this project.

## Architecture

React 18 + Vite 5 single-page Kanban board app. All state lives in `App.jsx` and is persisted to `localStorage` via the `useLocalStorage` hook. There is no backend or external API.

**Component tree**

```
App
├── Sidebar         - Board list: create, rename, delete, select
├── CreateTaskForm  - Adds a task to the active board
└── Board
    └── Column (Backlog / In Progress / Done)
        └── TaskCard - Edit, delete, drag source
```

**Data shape (localStorage key `kanban-boards`)**

```js
[{ id, name, tasks: [{ id, title, description, status }] }]
```

`status` is one of `'backlog' | 'in-progress' | 'done'`.

Drag-and-drop uses the HTML5 native API: `TaskCard` sets `draggable`, `Column` handles `onDrop` and calls `onMoveTask` up to `App`.

## Feature Model Workflow

Every code change must follow the workflow defined in `.claude/CLAUDE.md`. Key points:

- The feature tree lives in `.feature-model` at the repo root.
- Embedded annotations wrap feature-related code blocks:
  ```jsx
  {/* &begin[FeatureName] */}
  ...
  {/* &end[FeatureName] */}
  ```
  CSS uses `/* &begin[FeatureName] */` / `/* &end[FeatureName] */`.
- `.feature-to-file` metadata files in each directory map features to the files that implement them.
- The `fm-gui` MCP server (at `.claude/mcp/`) must be used to read the current feature model before making changes and to display a summary after changes.
