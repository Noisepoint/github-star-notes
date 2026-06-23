(function () {
  const STORAGE_KEY = "githubStarNotesData";
  const DATA_VERSION = 1;
  const MAX_NOTE_LENGTH = 500;

  function createEmptyData() {
    return {
      version: DATA_VERSION,
      repos: {}
    };
  }

  function normalizeRepoRecord(record, fallbackCreatedAt) {
    const now = new Date().toISOString();
    const note = typeof record?.note === "string" ? record.note.slice(0, MAX_NOTE_LENGTH) : "";

    return {
      note,
      tags: Array.isArray(record?.tags) ? record.tags.filter((tag) => typeof tag === "string") : [],
      createdAt: typeof record?.createdAt === "string" ? record.createdAt : fallbackCreatedAt || now,
      updatedAt: typeof record?.updatedAt === "string" ? record.updatedAt : now
    };
  }

  function normalizeData(rawData) {
    const data = createEmptyData();

    if (!rawData || typeof rawData !== "object" || !rawData.repos || typeof rawData.repos !== "object") {
      return data;
    }

    Object.entries(rawData.repos).forEach(([repoKey, record]) => {
      if (!window.GitHubStarNotesPage?.isValidRepoKey(repoKey)) {
        return;
      }

      const normalizedRecord = normalizeRepoRecord(record);
      if (normalizedRecord.note.trim()) {
        data.repos[repoKey] = normalizedRecord;
      }
    });

    return data;
  }

  async function getData() {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return normalizeData(result[STORAGE_KEY]);
  }

  async function setData(data) {
    await chrome.storage.local.set({
      [STORAGE_KEY]: normalizeData(data)
    });
  }

  async function getRepoNote(repoKey) {
    const data = await getData();
    return data.repos[repoKey] || null;
  }

  async function saveRepoNote(repoKey, note) {
    if (!window.GitHubStarNotesPage?.isValidRepoKey(repoKey)) {
      throw new Error("Invalid repo key");
    }

    const cleanedNote = note.trim();
    if (cleanedNote.length > MAX_NOTE_LENGTH) {
      throw new Error("Note is too long");
    }

    const data = await getData();
    const now = new Date().toISOString();
    const existing = data.repos[repoKey];

    if (!cleanedNote) {
      delete data.repos[repoKey];
    } else {
      data.repos[repoKey] = {
        note: cleanedNote,
        tags: existing?.tags || [],
        createdAt: existing?.createdAt || now,
        updatedAt: now
      };
    }

    await setData(data);
    return data.repos[repoKey] || null;
  }

  async function mergeImportedData(importedData) {
    const currentData = await getData();
    const normalizedImportedData = normalizeData(importedData);
    let importedCount = 0;

    Object.entries(normalizedImportedData.repos).forEach(([repoKey, record]) => {
      currentData.repos[repoKey] = normalizeRepoRecord(record, currentData.repos[repoKey]?.createdAt);
      importedCount += 1;
    });

    await setData(currentData);
    return {
      data: currentData,
      importedCount
    };
  }

  window.GitHubStarNotesStorage = {
    DATA_VERSION,
    MAX_NOTE_LENGTH,
    STORAGE_KEY,
    createEmptyData,
    getData,
    setData,
    getRepoNote,
    saveRepoNote,
    mergeImportedData,
    normalizeData
  };
})();
