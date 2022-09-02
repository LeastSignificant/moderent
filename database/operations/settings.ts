/**
 * This file is part of Moderent.
 *
 * Moderent is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Moderent is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Afferto General Public License
 * along with Moderent.  If not, see <https://www.gnu.org/licenses/>.
 */

import { database } from "../database.ts";
import { Collection } from "mongo";

export enum Captcha {
  Disabled = "disabled",
  Emoji = "emoji",
}

export interface Settings {
  logChat?: number | null;
  captcha?: Captcha | null;
}

let collection: Collection<Settings & { id: number }>;
const cache = new Map<number, Settings>();

export function initializeSettings() {
  collection = database.collection("chats");
  collection.createIndexes({
    indexes: [
      {
        key: { "id": 1 },
        name: "id",
        unique: true,
      },
      {
        key: { "logChat": 1 },
        name: "logChat",
        unique: true,
      },
    ],
  });
}

export async function getSettings(id: number): Promise<Settings> {
  let settings = cache.get(id);
  if (typeof settings === "undefined") {
    settings = await collection.findOne({ id }) ?? {};
    cache.set(id, settings);
  }
  return settings ?? {};
}

export async function updateSettings(id: number, settings: Settings) {
  const result = await collection.updateOne({ id }, { $set: { ...settings } });
  cache.set(id, settings);
  return result.modifiedCount != 0;
}