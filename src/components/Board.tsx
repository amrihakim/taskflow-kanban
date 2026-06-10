import Column from "./Column.js";
import type { Column as ColumnType } from "../types/kanban.js";

type BoardProps = {
  columns: ColumnType[];
  processingCardId: string | null;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (
    cardId: string,
    newTitle: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
};

function Board({
  columns,
  onDeleteCard,
  onEditCard,
  processingCardId,
}: BoardProps) {
  return (
    <section className="board">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          onDeleteCard={onDeleteCard}
          onEditCard={onEditCard}
          processingCardId={processingCardId}
        />
      ))}
    </section>
  );
}

export default Board;
