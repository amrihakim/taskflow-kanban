export type Card = {
  id: string;
  title: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

export type EditCardResult = {
  success: boolean;
  message: string;
};

export type OrderedCardIdsByColumn = Record<string, string[]>;

export type CreateCardPayload = {
  id: string;
  title: string;
};

export type MoveCardPayload = {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  orderedCardIdsByColumn: OrderedCardIdsByColumn;
};

export type MoveCardResponse = {
  success: boolean;
  data: MoveCardPayload;
};

export type UpdateCardPayload = {
  title: string;
};

export type DeleteCardResponse = {
  success: boolean;
  deletedCardId: string;
};
