import { Client, Permission, Role, TablesDB } from 'node-appwrite';

class AppwriteService {
  constructor(apiKey) {
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(apiKey);

    this.tablesDB = new TablesDB(client);
  }

  /**
   * Creates the orders database and table if they don't exist yet
   * @param {string} databaseId
   * @param {string} tableId
   * @returns {Promise<void>}
   */
  async setup(databaseId, tableId) {
    if (await this.doesOrdersTableExist(databaseId, tableId)) {
      return;
    }

    await this.setupOrdersTable(databaseId, tableId);
  }

  async doesOrdersTableExist(databaseId, tableId) {
    try {
      await this.tablesDB.getTable({ databaseId, tableId });
      return true;
    } catch (err) {
      if (err.code !== 404) throw err;
      return false;
    }
  }

  async setupOrdersTable(databaseId, tableId) {
    try {
      await this.tablesDB.create({ databaseId, name: 'Orders Database' });
    } catch (err) {
      if (err.code !== 409) throw err;
    }

    // Columns passed to createTable are available as soon as it returns, so
    // rows can be written right away.
    try {
      await this.tablesDB.createTable({
        databaseId,
        tableId,
        name: 'Orders',
        rowSecurity: true,
        columns: [
          { key: 'userId', type: 'varchar', size: 255, required: true },
          { key: 'orderId', type: 'varchar', size: 255, required: true },
        ],
      });
    } catch (err) {
      if (err.code !== 409) throw err;
    }
  }

  /**
   * Stores a paid order, using the order ID as the row ID so a repeated
   * webhook delivery can't store the same order twice
   * @param {string} databaseId
   * @param {string} tableId
   * @param {string} userId
   * @param {string} orderId
   * @returns {Promise<boolean>} false if the order was already stored
   */
  async createOrder(databaseId, tableId, userId, orderId) {
    try {
      await this.tablesDB.createRow({
        databaseId,
        tableId,
        rowId: orderId,
        data: {
          userId,
          orderId,
        },
        permissions: [Permission.read(Role.user(userId))],
      });
      return true;
    } catch (err) {
      if (err.code !== 409) throw err;
      return false;
    }
  }
}

export default AppwriteService;
