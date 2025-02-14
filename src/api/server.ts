import { Conversations } from '../model/conversation';

export class ServerRepo {
  url = 'https://api.botpress.cloud/v1';

  async getToken(): Promise<any> {
    const customUrl = `${this.url}/admin/account/pats`;
    const response = await fetch(customUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer bp_pat_eRpfMxOBeVrbO7s2l9ptZoA5aHGpw2LtQRVQ',
      },
      body: JSON.stringify({
        note: 'fronstssestdsstd',
      }),
    });
    if (!response.ok)
      throw new Error(response.status + ' ' + response.statusText);
    const result = await response.json();

    return result.pat.value;
  }

  async getWorkspaces(token: string): Promise<any> {
    const customUrl = `${this.url}/admin/workspaces`;
    const response = await fetch(customUrl, {
      headers: {
        Authorization: token,
      },
    });
    if (!response.ok)
      throw new Error(response.status + ' ' + response.statusText);
    const workspaces = await response.json();
    return workspaces;
  }

  async getBots(workspaceId: string, token: string): Promise<any> {
    const customUrl = `${this.url}/admin/bots`;
    const response = await fetch(customUrl, {
      headers: {
        'x-workspace-id': workspaceId,
        Authorization: token,
      },
    });
    if (!response.ok)
      throw new Error(response.status + ' ' + response.statusText);
    const workspaces = await response.json();
    return workspaces;
  }

  async getConversations(
    botId: string,
    token: string,
    nextToken?: string,
    phone?: string
  ): Promise<Conversations> {
    let url;

    if (phone) {
      url = `${this.url}/chat/conversations?tags[whatsapp:userPhone]=${phone}`;
    } else {
      url = `${this.url}/chat/conversations`;
    }

    if (nextToken) {
      url += `?nextToken=${nextToken}`;
    }

    const response = await fetch(url, {
      headers: {
        'x-bot-id': botId,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok)
      throw new Error(response.status + ' ' + response.statusText);
    const conversations = await response.json();

    return conversations;
  }

  async getMessages(
    botId: string,
    token: string,
    conversationId: string,
    nextToken?: string
  ): Promise<any> {
    let customUrl = `${this.url}/chat/messages?conversationId=${conversationId}`;
    if (nextToken) {
      customUrl += `&nextToken=${nextToken}`;
    }

    const response = await fetch(customUrl, {
      headers: {
        'x-bot-id': botId,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok)
      throw new Error(response.status + ' ' + response.statusText);
    const workspaces = await response.json();
    return workspaces;
  }
}
