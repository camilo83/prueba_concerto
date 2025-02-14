export type Conversation = {
  channel: string;
  createdAt: string;
  updatedAt: string;
  id: string;
  integration: string;
  tags: {
    'whatsapp:phoneNumberId': string;
    'whatsapp:userPhone': string;
  };
};

export type Conversations = {
  conversations: Conversation[];
  meta: {
    nextToken: string;
  };
};
