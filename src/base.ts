import type {
  Block,
  SectionBlock,
  MessageAttachment,
  RichTextBlock,
} from "@slack/web-api";
import { CoreAlert } from "./core.js";
import type { ContextItem } from "./interfaces/context-item.js";

export class BaseAlert extends CoreAlert {
  protected getColor({
    alertLevel,
  }: {
    alertLevel: "error" | "warning" | "info";
  }) {
    switch (alertLevel) {
      case "error":
        return "#B22222";
      case "warning":
        return "#ffa500";
      case "info":
        return "#3b76ff";
      default:
        return "#000000";
    }
  }
  protected makeContextEmoji(key: string) {
    switch (key) {
      case "userId":
        return "👤";
      case "userEmail":
        return "📧";
      case "organizationId":
        return "🏢";
      case "organizationName":
        return "🏢";
      default:
        return "🔍";
    }
  }
  protected makeContextBlock({ context }: { context: ContextItem[] }) {
    return context.length > 0
      ? {
          type: "context",
          elements: context
            .map((item) => {
              if (item.value) {
                return {
                  type: "plain_text",
                  text: `${this.makeContextEmoji(item.key)} ${item.value}`,
                  emoji: true,
                };
              }
              return null;
            })
            .filter((element) => element !== null),
        }
      : null;
  }
  protected makeCodeblock({
    text,
  }: {
    text?: string | undefined;
  }): SectionBlock | null {
    return text
      ? {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `\`\`\`\n${text}\n\`\`\``,
          },
        }
      : null;
  }

  protected makePayloadBlock({
    payload,
  }: {
    payload?: Record<string, unknown> | string | undefined;
  }): SectionBlock | null {
    return payload
      ? {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `\`\`\`\n${
              typeof payload === "string"
                ? payload
                : JSON.stringify(payload, null, 2)
            }\n\`\`\``,
          },
        }
      : null;
  }
  protected makeTextBlock({
    text,
  }: {
    text?: string | undefined;
  }): SectionBlock | null {
    return text
      ? {
          type: "section",
          text: {
            type: "mrkdwn",
            text: text,
          },
        }
      : null;
  }

  protected makeAttachment({
    color,
    blocks,
  }: {
    color: "good" | "warning" | "danger" | string;
    blocks: Block[];
  }): MessageAttachment {
    if (blocks.length === 0) {
      throw new Error("Blocks are required to create an attachment");
    }
    return { color, blocks };
  }

  protected async getUserIds(mentions: string[]): Promise<string[]> {
    const slackUsers = await this.slackClient.users.list({});
    const lowerMentions = mentions.map((m) => m.toLowerCase());
    return (
      slackUsers.members
        ?.filter((user) => {
          const userName = user.name?.toLowerCase();
          const realName = user.real_name?.toLowerCase();
          const displayName = user.profile?.display_name?.toLowerCase();
          return lowerMentions.some(
            (mention) =>
              userName === mention ||
              realName?.includes(mention) ||
              displayName?.includes(mention)
          );
        })
        .map((user) => user.id!)
        .filter((id) => id !== undefined) ?? []
    );
  }
  protected async makeMentionsBlock({
    mentions,
  }: {
    mentions?: string[] | undefined;
  }): Promise<RichTextBlock | null> {
    const userIds = mentions ? await this.getUserIds(mentions) : [];
    if (userIds.length === 0) {
      return null;
    }
    return {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: userIds.map((userId) => ({
            type: "user",
            user_id: userId,
          })),
        },
      ],
    };
  }

  protected makeTableCellBlock(text: string, isBold: boolean = false) {
    return {
      type: "rich_text",
      elements: [
        {
          type: "rich_text_section",
          elements: [
            {
              type: "text",
              text,
              ...(isBold ? { style: { bold: true } } : {}),
            },
          ],
        },
      ],
    };
  }
  protected makeTableBlock(headers: string[], rows: string[][]) {
    const headerRow = headers.map((header) =>
      this.makeTableCellBlock(header, true)
    );
    const dataRows = rows.map((row) =>
      row.map((cell) => this.makeTableCellBlock(cell, false))
    );
    return {
      type: "table",
      rows: [headerRow, ...dataRows],
    };
  }
}
