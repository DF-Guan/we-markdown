import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { HistorySnapshot } from "./historyTypes";

interface HistoryDB extends DBSchema {
  history: {
    key: string;
    value: HistorySnapshot;
  };
  draft: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = "ahafair-history";
const DB_VERSION = 2;
const HISTORY_LIMIT = 30;

let dbPromise: Promise<IDBPDatabase<HistoryDB>> | null = null;

async function getDB() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is not available in SSR");
  }
  if (!dbPromise) {
    dbPromise = openDB<HistoryDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("history");
        }
        if (oldVersion === 1) {
          if (db.objectStoreNames.contains("draft")) {
            db.deleteObjectStore("draft");
          }
          if (!db.objectStoreNames.contains("history")) {
            db.createObjectStore("history");
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function loadHistoryFromDb() {
  try {
    const db = await getDB();
    const rawHistory = await db.getAll("history");
    const history = rawHistory.map((entry) => {
      let title = entry.title || "未命名文章";
      let markdown = entry.markdown || "";
      let hasModified = false;

      // 自动清洗历史记录中残留的旧品牌词和多余文字
      if (
        /ahafair/i.test(title) ||
        title.includes("暗图排版") ||
        title.includes("暗图生态")
      ) {
        title =
          title
            .replace(/ahafair/gi, "WeMarkdown")
            .replace(/\s*\(?暗图排版\)?/g, "")
            .replace(/\s*\(?暗图生态\)?/g, "")
            .trim() || "未命名文章";
        hasModified = true;
      }
      if (
        /ahafair/i.test(markdown) ||
        markdown.includes("暗图排版") ||
        markdown.includes("暗图生态")
      ) {
        markdown = markdown
          .replace(/ahafair/gi, "WeMarkdown")
          .replace(/\s*\(?暗图排版\)?/g, "")
          .replace(/\s*\(?暗图生态\)?/g, "");
        hasModified = true;
      }

      const updated = {
        ...entry,
        title,
        markdown,
        createdAt: entry.createdAt || entry.savedAt,
        filePath: entry.filePath,
      };

      if (hasModified) {
        void db.put("history", updated, updated.id).catch(() => {});
      }

      return updated;
    });

    history.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
    return history;
  } catch (error) {
    console.error("[HistoryDB] load failed", error);
    return [];
  }
}

export async function addHistoryToDb(snapshot: HistorySnapshot) {
  try {
    const db = await getDB();
    await db.put("history", snapshot, snapshot.id);
    const tx = db.transaction("history", "readwrite");
    const store = tx.store;
    const all = await store.getAll();
    if (all.length > HISTORY_LIMIT) {
      all.sort(
        (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
      );
      const overflow = all.slice(0, all.length - HISTORY_LIMIT);
      for (const entry of overflow) {
        await store.delete(entry.id);
      }
    }
    await tx.done;
  } catch (error) {
    console.error("[HistoryDB] add history failed", error);
  }
}

export async function deleteHistoryFromDb(id: string) {
  try {
    const db = await getDB();
    await db.delete("history", id);
  } catch (error) {
    console.error("[HistoryDB] delete failed", error);
  }
}

export async function updateHistoryInDb(entry: HistorySnapshot) {
  try {
    const db = await getDB();
    await db.put("history", entry, entry.id);
  } catch (error) {
    console.error("[HistoryDB] update failed", error);
  }
}

export async function clearHistoryDb() {
  try {
    const db = await getDB();
    await db.clear("history");
  } catch (error) {
    console.error("[HistoryDB] clear failed", error);
  }
}
