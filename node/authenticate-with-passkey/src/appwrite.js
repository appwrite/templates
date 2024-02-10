import { Client, Users, ID, Databases, Query } from 'node-appwrite';

class AppwriteService {
  constructor() {
    const client = new Client();
    client
      .setEndpoint(
        process.env.APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1'
      )
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    this.users = new Users(client);
    this.databases = new Databases(client);
  }

  async prepareUser(email) {
    const response = await this.users.list([ Query.equal('email', email), Query.limit(1) ]);
    let user = response.users[0] ?? null;

    if(!user) {
      user = await this.users.create(ID.unique(), email);
    }
    
    return user;
  }

  async createChallenge(userId, token) {
    return await this.databases.createDocument('main', 'challenges', ID.unique(), {
      userId: userId,
      token
    });
  }

  async getChallenge(challengeId) {
    return await this.databases.getDocument('main', 'challenges', challengeId);
  }

  async deleteChallenge(challengeId) {
    return await this.databases.deleteDocument('main', 'challenges', challengeId);
  }

  async createCredentials(userId, credentials) {
    return await this.databases.createDocument('main', 'credentials', ID.unique(), {
      userId,
      credentials
    });
  }
}

export default AppwriteService;
