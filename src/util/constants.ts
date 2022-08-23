export const webhookRegex = /^https:\/\/(?:canary|ptb)\.discord\.com\/api(?:\/v10)?\/webhooks\/(?<id>\d{17,19})\/(?<token>[\w-]+)(?:\?(?<query>.*))?$/;

export const baseURL = 'https://discord.com/api/v10';

export const routes = {
  webhook: (id: string, token: string) => ({
    toString: () => `${baseURL}/api/webhooks/${id}/${token}`,
    message(messageID: string) {
      return `${this}/messages/${messageID}`;
    }
  })
}