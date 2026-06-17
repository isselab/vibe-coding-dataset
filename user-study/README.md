# User Study

Counterbalanced within-subjects study evaluating the fm-workflow tool during vibe coding.

## Structure

```
user-study/
├── group1/
│   ├── task1/   # Recipe app — with fm-workflow
│   └── task2/   # Kanban app — without fm-workflow
├── group2/
│   ├── task1/   # Recipe app — without fm-workflow
│   └── task2/   # Kanban app — with fm-workflow
└── README.md
```

## Groups

| Group | Task 1 (Recipe) | Task 2 (Kanban) |
|-------|----------------|-----------------|
| 1     | fm-workflow    | baseline        |
| 2     | baseline       | fm-workflow     |

Each task directory is a self-contained React + Vite project. Run `npm install && npm run dev` inside a task folder to start it.
