export type Message = {
  id: string;
  createdAt: string;
  conversationId: string;
  payload: {
    text: string;
  };
  tags: {
    [key: string]: string;
  };
  userId: string;
  type: string;
  direction: 'incoming' | 'outgoing';
};
