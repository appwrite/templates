import { Client, Users } from 'node-appwrite';

const LabelsSubscriber = 'subscriber';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    this.users = new Users(client);
  }

  /**
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async deleteSubscription(userId) {
    const labels = (await this.users.get(userId)).labels.filter(
      (label) => label !== LabelsSubscriber
    );

    await this.users.updateLabels(userId, labels);
  }

  /**
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async createSubscription(userId) {
    const labels = (await this.users.get(userId)).labels;
    labels.push(LabelsSubscriber);

    await this.users.updateLabels(userId, labels);
  }
}

export default AppwriteService;
