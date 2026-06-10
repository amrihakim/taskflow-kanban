import { arrayMove } from "@dnd-kit/sortable";
import type { Column, Card, OrderedCardIdsByColumn } from "../types/kanban.ts";

export function findColumnByCardId(
  columns: Column[],
  cardId: string,
): Column | undefined {
  return columns.find((column) =>
    column.cards.some((card) => card.id === cardId),
  );
}

export function findColumnById(
  columns: Column[],
  columnId: string,
): Column | undefined {
  return columns.find((column) => column.id === columnId);
}

export function findCardById(columns: Column[], cardId: string): Card | null {
  for (const column of columns) {
    const card = column.cards.find((card) => card.id === cardId);

    if (card) {
      return card;
    }
  }

  return null;
}

export function getOrderedCardIdsByColumn(
  columns: Column[],
): OrderedCardIdsByColumn {
  return columns.reduce<OrderedCardIdsByColumn>((result, column) => {
    result[column.id] = column.cards.map((card) => card.id);
    return result;
  }, {});
}

type MoveCardInColumnsParams = {
  columns: Column[];
  activeCardId: string;
  overId: string;
  fromColumn: Column;
  toColumn: Column;
};

export function moveCardInColumns({
  columns,
  activeCardId,
  overId,
  fromColumn,
  toColumn,
}: MoveCardInColumnsParams): Column[] {
  const fromColumnId = fromColumn.id;
  const toColumnId = toColumn.id;

  const movedCard = fromColumn.cards.find((card) => card.id === activeCardId);

  if (!movedCard) return columns;

  if (fromColumnId === toColumnId) {
    const oldIndex = fromColumn.cards.findIndex(
      (card) => card.id === activeCardId,
    );

    const newIndex = fromColumn.cards.findIndex((card) => card.id === overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return columns;
    }

    return columns.map((column) => {
      if (column.id !== fromColumnId) {
        return column;
      }

      return {
        ...column,
        cards: arrayMove(column.cards, oldIndex, newIndex),
      };
    });
  }

  const columnsWithoutMovedCard = columns.map((column) => {
    if (column.id !== fromColumnId) {
      return column;
    }

    return {
      ...column,
      cards: column.cards.filter((card) => card.id !== activeCardId),
    };
  });

  return columnsWithoutMovedCard.map((column) => {
    if (column.id !== toColumnId) {
      return column;
    }

    const overCardIndex = column.cards.findIndex((card) => card.id === overId);

    if (overCardIndex === -1) {
      return {
        ...column,
        cards: [...column.cards, movedCard],
      };
    }

    return {
      ...column,
      cards: [
        ...column.cards.slice(0, overCardIndex),
        movedCard,
        ...column.cards.slice(overCardIndex),
      ],
    };
  });
}
