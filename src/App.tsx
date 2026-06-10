import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import "./App.css";

import Board from "./components/Board.js";
import useKanbanBoard from "./hooks/useKanbanBoard.js";

function App() {
  const {
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
  } = useKanbanBoard();

  return (
    <main className="app">
      <h1>Kanban Board</h1>

      <div className="add-card-form">
        <input
          type="text"
          placeholder="Add New Task..."
          value={newCardTitle}
          onChange={(event) => {
            setNewCardTitle(event.target.value);
            setAddCardError("");
          }}
        />

        <button type="button" onClick={handleAddCard} disabled={isAddingCard}>
          {isAddingCard ? "Saving..." : "Add Card"}
        </button>

        <button
          onClick={handleResetBoard}
          className="reset-button"
          disabled={isAddingCard}
        >
          Reset Board
        </button>
      </div>

      {addCardError && <p className="form-error">{addCardError}</p>}

      {boardError && <p className="form-error">{boardError}</p>}

      {isMovingCard && <p className="board-status">Saving card position...</p>}

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Board
          columns={columns}
          processingCardId={processingCardId}
          onDeleteCard={handleDeleteCard}
          onEditCard={handleEditCard}
        />

        <DragOverlay>
          {activeCard ? (
            <article className="card card-overlay">{activeCard.title}</article>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}

export default App;
