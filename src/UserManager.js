import config from './config';

export default class UserManager {
  constructor() {
    this.cache = new Map();
  }

  async getUser(userId) {
    if (this.cache.has(userId)) {
      return this.cache.get(userId);
    }

    const user = (async () => {
      const response = await fetch(`https://api.twitch.tv/kraken/users/${userId}`, {
        headers: {
          accept: 'application/vnd.twitchtv.v5+json',
          'client-id': config.clientId,
        }
      });
      return response.json();
    })();
    this.cache.set(userId, user);
    return user;
  }
}