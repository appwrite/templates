import { Client, Users } from 'node-appwrite';

const LabelsSubscriber = 'subscriber';

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
