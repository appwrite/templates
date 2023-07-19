import { Client, Databases } from 'node-appwrite';

const Subscriptions = {
  PREMIUM: 'premium',
};

function AppwriteService(environment) {
  const {
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY,
    DATABASE_ID,
    DATABASE_NAME,
    COLLECTION_ID,
    COLLECTION_NAME,
  } = environment;

  const client = new Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  return {
    /**
     * @returns {Promise<boolean>}
     */
    doesSubscribersDatabaseExist: async function () {
      try {
        await databases.get(DATABASE_ID);
        return true;
      } catch (err) {
        if (err.code === 404) return false;
        throw err;
      }
    },
    setupSubscribersDatabase: async function () {
      try {
        await databases.create(DATABASE_ID, DATABASE_NAME);
        await databases.createCollection(
          DATABASE_ID,
          COLLECTION_ID,
          COLLECTION_NAME
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'userId',
          255,
          true
        );
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          'subscriptionType',
          255,
          true
        );
      } catch (err) {
        // If resource already exists, we can ignore the error
        if (err.code !== 409) throw err;
      }
    },
    /**
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    hasSubscription: async function (userId) {
      try {
        await databases.getDocument(DATABASE_ID, COLLECTION_ID, userId);
        return true;
      } catch (err) {
        if (err.code !== 404) throw err;
        return false;
      }
    },
    /**
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    deleteSubscription: async function (userId) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, userId);
        return true;
      } catch (err) {
        return false;
      }
    },
    /**
     * @param {string} userId
     * @returns {Promise<boolean>}
     */
    createSubscription: async function (userId) {
      try {
        await databases.createDocument(DATABASE_ID, COLLECTION_ID, userId, {
          subscriptionType: Subscriptions.PREMIUM,
        });
        return true;
      } catch (err) {
        return false;
      }
    },
  };
}

export default AppwriteService;
