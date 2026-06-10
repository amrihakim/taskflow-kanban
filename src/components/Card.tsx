import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Card as CardType, EditCardResult } from "../types/kanban.js";

type CardProps = {
  card: CardType;
  isProcessing: boolean;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (cardId: string, newTitle: string) => Promise<EditCardResult>;
};

function Card({ card, isProcessing, onDeleteCard, onEditCard }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editError, setEditError] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isEditing || isProcessing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleStartEdit() {
    setEditedTitle(card.title);
    setEditError("");
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setEditedTitle(card.title);
    setEditError("");
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    const result = await onEditCard(card.id, editedTitle);

    if (!result.success) {
      setEditError(result.message);
      return;
    }

    setEditError("");
    setIsEditing(false);
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      void handleSaveEdit();
    }

    if (event.key === "Escape") {
      handleCancelEdit();
    }
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={isDragging ? "card card-dragging" : "card"}
      {...attributes}
    >
      {isEditing ? (
        <div className="card-edit-form">
          <input
            type="text"
            value={editedTitle}
            disabled={isProcessing}
            onChange={(event) => {
              setEditedTitle(event.target.value);
              setEditError("");
            }}
            onKeyDown={handleEditKeyDown}
            autoFocus
          />

          {editError && <p className="card-edit-error">{editError}</p>}

          <div className="card-edit-actions">
            <button
              type="button"
              onClick={() => void handleSaveEdit()}
              disabled={isProcessing}
            >
              {isProcessing ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className="card-title" {...listeners}>
            {card.title}
          </span>

          <div className="card-actions">
            <button
              type="button"
              className="card-edit-button"
              onClick={handleStartEdit}
              disabled={isProcessing}
            >
              Edit
            </button>

            <button
              type="button"
              className="card-delete-button"
              onClick={() => onDeleteCard(card.id)}
              disabled={isProcessing}
            >
              ×
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default Card;
