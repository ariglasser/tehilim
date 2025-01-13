
const PERK_DATA = 'perkData'
const PERK_AUDIO = 'perkAudio'
const PERK_TABLES = [PERK_DATA, PERK_AUDIO]
const DB_NAME = 'thilimDB'
const DB_VERSION = 1

class ResourceCache {
  constructor() {
    this.db = null;
  }

  async open() {
    if (!this.initialize) {
      this.initialize = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          for (const table of PERK_TABLES) {
            if (!db.objectStoreNames.contains(table)) {
              db.createObjectStore(table, {keyPath: "perk"});
            }
          }
        };

        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };

        request.onerror = (event) => reject(event.target.error);
      });
    }
    return this.initialize;
  }

  async transaction(storeName, mode) {
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  async put(storeName, data, perk) {
    await this.open();
    const store = await this.transaction(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.put({data, perk});
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async get(storeName, perk) {
    await this.open();
    const store = await this.transaction(storeName, "readonly");
    return new Promise((resolve, reject) => {
      const request = store.get(perk);
      request.onsuccess = () => {
        resolve(request.result?.data);
      }
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async delete(storeName, perk) {
    await this.open();

    const store = await this.transaction(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.delete(perk);
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async clear(storeName) {
    await this.open();
    const store = await this.transaction(storeName, "readwrite");
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event.target.error);
    });
  }
}

const CACHE = new ResourceCache();


export function getPerkMp3Name(perk) {
  return `./mp3/${perk.toString().padStart(3, '0')}.mp3`;
}

export function getPerkDataName(perk) {
  return `./prakim/${perk.toString().padStart(3, '0')}.json`;
}

export async function getPerkDuration(perk) {
  const d = await loadPerkData(perk)
  return d.duration;
}

export async function loadPerkData(perk) {
  let perkData = await CACHE.get(PERK_DATA, perk)
  if (!perkData) {
    perkData = await (await fetch(getPerkDataName(perk))).json();
    perkData = JSON.stringify(perkData)
    await CACHE.put(PERK_DATA,perkData,perk);
  }
  perkData = JSON.parse(perkData);


  return perkData;
}
export async function loadPerkAudio(perk) {
  let audioData = await CACHE.get(PERK_AUDIO, perk);

  if (!audioData) {
    const audioBlob = await (await fetch(getPerkMp3Name(perk))).blob();
    const arrayBuffer = await audioBlob.arrayBuffer();

    await CACHE.put(PERK_AUDIO, arrayBuffer, perk);
    audioData = arrayBuffer;
  }

  const uint8Array = new Uint8Array(audioData);
  const audioBlob = new Blob([uint8Array], { type: 'audio/mpeg' });

  return URL.createObjectURL(audioBlob);
}
