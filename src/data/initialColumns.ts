import type { Column } from "../types/kanban.ts";

export const initialColumns: Column[] = [
  {
    id: "todo",
    title: "Todo",
    cards: [
      { id: "task-1", title: "Learn React component" },
      { id: "task-2", title: "Create Kanban layout" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    cards: [{ id: "task-3", title: "Understand React state" }],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "task-4", title: "Setup Vite project" }],
  },
];
