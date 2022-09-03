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

import { Context, Session } from "./types.ts";
import { ChatAdministratorRights } from "grammy/types.ts";
import { Middleware, session as session_ } from "grammy";

export const session = session_({
  initial: (): Session => ({
    admins: new Map(),
  }),
});

export function withRights(
  requiredRights:
    | ((keyof ChatAdministratorRights) | "owner")
    | (((keyof ChatAdministratorRights) | "owner"))[],
): Middleware<Context> {
  return async (ctx, next) => {
    if (ctx.has("message")) {
      requiredRights = Array.isArray(requiredRights)
        ? requiredRights
        : [requiredRights];
      const rights = ctx.session.admins.get(ctx.from.id);
      if (
        rights && ((requiredRights.includes("owner") &&
          rights.status == "creator") || (rights.status == "creator" || (
            rights.status == "administrator" &&
            (requiredRights as (keyof ChatAdministratorRights)[]).every((
              v,
            ) => rights[v])
          )))
      ) {
        await next();
      } else {
        const text = "Permission denied.";
        if (ctx.message) {
          await ctx.reply(text);
        } else if (ctx.callbackQuery) {
          await ctx.answerCallbackQuery({ text, show_alert: true });
        }
      }
    }
  };
}
