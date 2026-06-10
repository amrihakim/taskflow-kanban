import Card from "./Card.js";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { Column as ColumnType, EditCardResult } from "../types/kanban.js";

type ColumnProps = {
  column: ColumnType;
  processingCardId: string | null;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (cardId: string, newTitle: string) => Promise<EditCardResult>;
};

function Column({
  column,
  onDeleteCard,
  onEditCard,
  processingCardId,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const cardIds = column.cards.map((card) => card.id);

  return (
    <div ref={setNodeRef} className={isOver ? "column column-over" : "column"}>
      <h2>{column.title}</h2>

      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <div className="card-list">
          {column.cards.filter(Boolean).map((card) => (
            <Card
              key={card.id}
              card={card}
              onDeleteCard={onDeleteCard}
              onEditCard={onEditCard}
              isProcessing={processingCardId === card.id}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default Column;
