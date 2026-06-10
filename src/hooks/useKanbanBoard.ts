import { useEffect, useState } from "react";

import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

import { initialColumns } from "../data/initialColumns.js";
import {
  createCardApi,
  deleteCardApi,
  moveCardApi,
  updateCardApi,
} from "../services/kanbanApi.js";
import type { Card, Column, EditCardResult } from "../types/kanban.ts";
import {
  findCardById,
  findColumnByCardId,
  findColumnById,
  getOrderedCardIdsByColumn,
  moveCardInColumns,
} from "../utils/kanban.js";

const STORAGE_KEY = "react-kanban-columns";

function useKanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(() => {
    const savedColumns = localStorage.getItem(STORAGE_KEY);

    if (!savedColumns) {
      return initialColumns;
    }

    try {
      return JSON.parse(savedColumns) as Column[];
    } catch (error) {
      return initialColumns;
    }
  });

  const [newCardTitle, setNewCardTitle] = useState("");
  const [addCardError, setAddCardError] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [boardError, setBoardError] = useState("");
  const [isMovingCard, setIsMovingCard] = useState(false);
  const [processingCardId, setProcessingCardId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  }, [columns]);

  async function handleAddCard() {
    const cleanedTitle = newCardTitle.trim();

    if (!cleanedTitle) {
      setAddCardError("Task title cannot be empty.");
      return;
    }

    if (cleanedTitle.length < 3) {
      setAddCardError("Task title must be at least 3 characters long.");
      return;
    }

    const todoColumn = findColumnById(columns, "todo");

    if (!todoColumn) {
      setAddCardError("Todo column not found.");
      return;
    }

    const isDuplicate = todoColumn.cards.some(
      (card) => card.title.toLowerCase() === cleanedTitle.toLowerCase(),
    );

    if (isDuplicate) {
      setAddCardError("A task with this title already exists.");
      return;
    }

    // if (!newCardTitle.trim()) return;

    setIsAddingCard(true);
    setAddCardError("");
    try {
      const newCard = await createCardApi({
        title: cleanedTitle,
        id: "todo",
      });

      setColumns((currentColumns) =>
        currentColumns.map((column) => {
          if (column.id !== "todo") {
            return column;
          }

          return {
            ...column,
            cards: [...column.cards, newCard],
          };
        }),
      );

      setNewCardTitle("");
    } catch (error) {
      console.error("Error adding card:", error);
      setAddCardError("Failed to add task. Please try again.");
    } finally {
      setIsAddingCard(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const cardId = String(event.active.id);
    const card = findCardById(columns, cardId);
    setActiveCard(card);
  }

  function handleDragCancel() {
    setActiveCard(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeCardId = String(active.id);
    const overId = String(over.id);

    const fromColumn = findColumnByCardId(columns, activeCardId);
    const overColumnByCard = findColumnByCardId(columns, overId);
    const overColumnById = findColumnById(columns, overId);

    const toColumn = overColumnByCard || overColumnById;

    if (!fromColumn || !toColumn) return;

    const fromColumnId = fromColumn.id;
    const toColumnId = toColumn.id;

    const updatedColumns = moveCardInColumns({
      columns,
      activeCardId,
      overId,
      fromColumn,
      toColumn,
    });

    const previousColumn = columns;

    setColumns(updatedColumns);
    setBoardError("");
    setIsMovingCard(true);

    try {
      await moveCardApi({
        cardId: activeCardId,
        fromColumnId,
        toColumnId,
        orderedCardIdsByColumn: getOrderedCardIdsByColumn(updatedColumns),
      });
    } catch (error) {
      console.error("Error moving card:", error);
      setBoardError("Failed to move task. Please try again.");
      setColumns(previousColumn);
    } finally {
      setIsMovingCard(false);
      setActiveCard(null);
    }
  }

  function handleResetBoard() {
    localStorage.removeItem(STORAGE_KEY);
    setColumns(initialColumns);
  }

  async function handleDeleteCard(cardId: string) {
    const previousColumns = columns;
    const updatedColumns = columns.map((column) => {
      return {
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      };
    });
    setColumns(updatedColumns);

    setBoardError("");
    setProcessingCardId(cardId);

    try {
      await deleteCardApi(cardId);
    } catch (error) {
      console.error("Error deleting card:", error);
      setBoardError("Failed to delete task. Please try again.");
      setColumns(previousColumns);
    } finally {
      setProcessingCardId(null);
    }
  }

  async function handleEditCard(
    cardId: string,
    newTitle: string,
  ): Promise<EditCardResult> {
    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      return {
        success: false,
        message: "Task title cannot be empty.",
      };
    }
    if (cleanTitle.length < 3) {
      return {
        success: false,
        message: "Task title must be at least 3 characters long.",
      };
    }

    const editedColumn = findColumnByCardId(columns, cardId);

    if (!editedColumn) {
      return {
        success: false,
        message: "Card column not found.",
      };
    }

    const isDuplicate = editedColumn.cards.some(
      (card) =>
        card.id !== cardId &&
        card.title.toLowerCase() === cleanTitle.toLowerCase(),
    );

    if (isDuplicate) {
      return {
        success: false,
        message: "A task with this title already exists in this card.",
      };
    }

    const previousColumns = columns;
    const updatedColums = columns.map((column) => {
      return {
        ...column,
        cards: column.cards.map((card) => {
          if (card.id !== cardId) {
            return card;
          }

          return {
            ...card,
            title: cleanTitle,
          };
        }),
      };
    });

    setColumns(updatedColums);
    setBoardError("");
    setProcessingCardId(cardId);

    try {
      await updateCardApi(cardId, {
        title: cleanTitle,
      });

      return {
        success: true,
        message: "",
      };
    } catch (error) {
      console.error("Error editing card:", error);
      setBoardError("Failed to edit task. Please try again.");
      setColumns(previousColumns);

      return {
        success: false,
        message: "Failed to update card. Changes reverted.",
      };
    } finally {
      setProcessingCardId(null);
    }
  }

  return {
    columns,
    newCardTitle,
    setNewCardTitle,
    addCardError,
    setAddCardError,
    activeCard,
    handleAddCard,
    handleEditCard,
    handleDeleteCard,
    handleResetBoard,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isAddingCard,
    boardError,
    isMovingCard,
    processingCardId,
  };
}

export default useKanbanBoard;
