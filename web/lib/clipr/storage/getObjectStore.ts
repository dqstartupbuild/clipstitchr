import { openCliprDatabase } from "@/lib/clipr/storage/openCliprDatabase";

export type ObjectStoreHandle = {
  database: IDBDatabase;
  transaction: IDBTransaction;
  store: IDBObjectStore;
};

export async function getObjectStore(
  storeName: string,
  mode: IDBTransactionMode,
): Promise<ObjectStoreHandle> {
  const database = await openCliprDatabase();
  const transaction = database.transaction(storeName, mode);
  const store = transaction.objectStore(storeName);

  transaction.oncomplete = () => database.close();
  transaction.onerror = () => database.close();
  transaction.onabort = () => database.close();

  return { database, transaction, store };
}
