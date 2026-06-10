import type {
  Card,
  CreateCardPayload,
  DeleteCardResponse,
  MoveCardPayload,
  MoveCardResponse,
  UpdateCardPayload,
} from "../types/kanban.ts";

const FAKE_API_DELAY = 1000;
const FAILURE_RATE = 0;

function shouldFail() {
  return Math.random() < FAILURE_RATE;
}

export function createCardApi(payload: CreateCardPayload): Promise<Card> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail()) {
        reject(new Error("Failed to create card. Please try again."));
        return;
      }

      const createdCard = {
        id: `task-${Date.now()}`,
        title: payload.title,
      };
      resolve(createdCard);
    }, FAKE_API_DELAY);
  });
}

export function moveCardApi(
  payload: MoveCardPayload,
): Promise<MoveCardResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail()) {
        reject(new Error("Failed to move card. Please try again."));
        return;
      }

      resolve({
        success: true,
        data: payload,
      });
    }, FAKE_API_DELAY);
  });
}

export function updateCardApi(
  cardId: string,
  payload: UpdateCardPayload,
): Promise<Card> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail()) {
        reject(new Error("Failed to update card. Please try again."));
        return;
      }

      resolve({
        id: cardId,
        title: payload.title,
      });
    }, FAKE_API_DELAY);
  });
}

export function deleteCardApi(cardId: string): Promise<DeleteCardResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail()) {
        reject(new Error("Failed to delete card. Please try again."));
        return;
      }

      resolve({
        success: true,
        deletedCardId: cardId,
      });
    }, FAKE_API_DELAY);
  });
}
