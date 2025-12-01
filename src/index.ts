import dotenv from "dotenv";
import type { ContextItem } from "./interfaces/context-item.js";
import { BaseAlert } from "./base.js";
dotenv.config();

/**
 * Keep track of scopes:
 * read:users for mentions
 * chat:write for posting messages
 */
class Alert extends BaseAlert {
  protected readonly context: ContextItem[] = [];
  public addContext(context: ContextItem | ContextItem[]) {
    const items = Array.isArray(context) ? context : [context];
    for (const item of items) {
      if (
        item.value &&
        !this.context.some(
          (existing) =>
            existing.key === item.key && existing.value === item.value
        )
      ) {
        this.context.push(item);
      }
    }
  }

  // #region Info
  public async info({
    text,
    serviceName,
    payload,
    mentions,
  }: {
    text: string;
    serviceName: string;
    payload?: any | string | Record<string, unknown>;
    mentions?: string[];
  }) {
    // Top Level Blocks
    const mentionsBlock = await this.makeMentionsBlock({ mentions });
    const topLevelBlocks = mentionsBlock ? [mentionsBlock] : undefined;

    // Attachment Blocks
    const textBlock = this.makeTextBlock({
      text: `*INFO* : *${serviceName}* - ${text}`,
    });
    const payloadBlock = this.makePayloadBlock({ payload });
    const contextBlock = this.makeContextBlock({ context: this.context });
    const attachmentBlocks = [contextBlock, textBlock, payloadBlock].filter(
      (block) => block !== null
    );
    const attachment = this.makeAttachment({
      color: this.getColor({ alertLevel: "info" }),
      blocks: attachmentBlocks,
    });

    await this.sendToSlack({
      attachments: [attachment],
      textOnNotification: text,
      blocks: topLevelBlocks,
    });
  }

  // #region Warning
  public async warning({
    text,
    serviceName,
    payload,
    mentions,
  }: {
    text: string;
    serviceName: string;
    payload?: Record<string, unknown>;
    mentions?: string[];
  }) {
    // Top Level Blocks
    const mentionsBlock = await this.makeMentionsBlock({ mentions });
    const topLevelBlocks = mentionsBlock ? [mentionsBlock] : undefined;

    // Attachment Blocks
    const textBlock = this.makeTextBlock({
      text: `*WARNING*: *${serviceName}* - ${text}`,
    });
    const payloadBlock = this.makePayloadBlock({ payload });
    const contextBlock = this.makeContextBlock({ context: this.context });
    const attachmentBlocks = [contextBlock, textBlock, payloadBlock].filter(
      (block) => block !== null
    );
    const attachment = this.makeAttachment({
      color: this.getColor({ alertLevel: "warning" }),
      blocks: attachmentBlocks,
    });

    await this.sendToSlack({
      attachments: [attachment],
      textOnNotification: text,
      blocks: topLevelBlocks,
    });
  }

  // #region Error
  public async error({
    text,
    serviceName,
    stackTrace,
    payload,
    mentions,
  }: {
    text: string;
    serviceName: string;
    stackTrace?: string;
    payload?: Record<string, unknown> | string ;
    mentions?: string[];
  }) {
    // Top Level Blocks
    const mentionsBlock = await this.makeMentionsBlock({ mentions });
    const topLevelBlocks = mentionsBlock ? [mentionsBlock] : undefined;

    // Attachment Blocks
    const stackTraceBlock = this.makeCodeblock({ text: stackTrace });
    const payloadBlock = this.makePayloadBlock({ payload });

    const textBlock = this.makeTextBlock({
      text: `*ERROR*: *${serviceName}* - ${text}`,
    });

    const contextBlock = this.makeContextBlock({ context: this.context });

    const attachmentBlocks = [
      contextBlock,
      textBlock,
      stackTraceBlock,
      payloadBlock,
    ].filter((block) => block !== null);

    const attachment = this.makeAttachment({
      color: this.getColor({ alertLevel: "error" }),
      blocks: attachmentBlocks,
    });

    await this.sendToSlack({
      attachments: [attachment],
      textOnNotification: text,
      blocks: topLevelBlocks,
    });
  }

  // #region Table
  public async table<T>({
    title,
    headers,
    items,
    rowMapper,
    serviceName,
    alertLevel = "info",
    mentions,
  }: {
    title: string;
    headers: string[];
    items: T[];
    rowMapper: (item: T) => string[];
    serviceName: string;
    alertLevel: "error" | "warning" | "info";
    mentions?: string[];
  }) {
    if (items.length === 0) {
      await this.info({ text: "No items to process", serviceName });
      return;
    }
    // Top Level Blocks
    const mentionsBlock = await this.makeMentionsBlock({ mentions });
    const topLevelBlocks = mentionsBlock ? [mentionsBlock] : undefined;

    // Attachment Blocks
    const textBlock = this.makeTextBlock({
      text: `*${alertLevel.toUpperCase()}*: *${serviceName}* - ${title}`,
    });
    const rows = items.map(rowMapper);
    const table = this.makeTableBlock(headers, rows);
    const contextBlock = this.makeContextBlock({ context: this.context });
    const attachmentBlocks = [contextBlock, textBlock, table].filter(
      (block) => block !== null
    );
    const attachment = this.makeAttachment({
      color: this.getColor({ alertLevel }),
      blocks: attachmentBlocks,
    });

    await this.sendToSlack({
      attachments: [attachment],
      textOnNotification: title,
      blocks: topLevelBlocks,
    });
  }
}

export { Alert as DoNotUseThisDirectly };
export default new Alert();
