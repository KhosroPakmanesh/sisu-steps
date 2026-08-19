import { DATABASE_NAME, DATABASE_VERSION, LEARNER_STATE_STORE } from './database.constants';

export function openLearnerDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in globalThis)) {
    return Promise.reject(new Error('This browser does not provide IndexedDB storage.'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(LEARNER_STATE_STORE)) {
        request.result.createObjectStore(LEARNER_STATE_STORE);
      }
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () =>
      reject(request.error ?? new Error('Could not open local learner storage.'));
    request.onblocked = () =>
      reject(new Error('Local storage is blocked by another open app window.'));
  });
}
