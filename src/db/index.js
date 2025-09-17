// RxDB setup for replacing mocks
import { createRxDatabase, addRxPlugin } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'

// Add dev-mode plugin in development
if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin)
}

let dbPromise

export async function getDB() {
  if (!dbPromise) {
    dbPromise = createRxDatabase({
      name: 'navidb',
      storage: getRxStorageDexie(),
    })

    const db = await dbPromise

    // Add collections here as needed
    // await db.addCollections({
    //   users: { schema: userSchema },
    //   jobs: { schema: jobSchema },
    //   portfolio: { schema: portfolioSchema }
    // });
  }
  return dbPromise
}

export default getDB
