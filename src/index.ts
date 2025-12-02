import dotenv from "dotenv";
import { BaseAlert } from "./base.js";
import type {
  IAlert,
  IBaseAlertOptions,
  IContextItem,
  ITableOptions,
} from "./interfaces/IAlert.js";
dotenv.config();

class Alert extends BaseAlert implements IAlert {
  protected readonly context: IContextItem[] = [];
  public addContext(context: IContextItem | IContextItem[]) {
    try {
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
    } catch (error) {
      console.error("Error adding context", error);
    }
  }

  // #region Info
  public async info({
    text,
    serviceName,
    payload,
    mentions,
  }: IBaseAlertOptions) {
    try {
      // Top Level Blocks
      const mentionsBlock = await this.makeMentionsBlock({ mentions });
      const contextBlock = this.makeContextBlock({ context: this.context });
      const topLevelBlocks = [mentionsBlock, contextBlock].filter(
        (block) => block !== null
      );

      // Attachment Blocks
      const textBlock = this.makeTextBlock({
        text: `*INFO* : *${serviceName}* - ${text}`,
      });
      const payloadBlock = this.makePayloadBlock({ payload });
      const attachmentBlocks = [textBlock, payloadBlock].filter(
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
    } catch (error) {
      console.error("Error sending info alert", error);
    }
  }

  // #region Warning
  public async warning({
    text,
    serviceName,
    payload,
    mentions,
  }: IBaseAlertOptions) {
    try {
      // Top Level Blocks
      const mentionsBlock = await this.makeMentionsBlock({ mentions });
      const contextBlock = this.makeContextBlock({ context: this.context });
      const topLevelBlocks = [mentionsBlock, contextBlock].filter(
        (block) => block !== null
      );

      // Attachment Blocks
      const textBlock = this.makeTextBlock({
        text: `*WARNING*: *${serviceName}* - ${text}`,
      });
      const payloadBlock = this.makePayloadBlock({ payload });
      const attachmentBlocks = [textBlock, payloadBlock].filter(
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
    } catch (error) {
      console.error("Error sending warning alert", error);
    }
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
    payload?: Record<string, unknown> | string;
    mentions?: string[];
  }) {
    try {
      // Top Level Blocks
      const mentionsBlock = await this.makeMentionsBlock({ mentions });
      const contextBlock = this.makeContextBlock({ context: this.context });
      const topLevelBlocks = [mentionsBlock, contextBlock].filter(
        (block) => block !== null
      );

      // Attachment Blocks
      const stackTraceBlock = this.makeCodeblock({ text: stackTrace });
      const payloadBlock = this.makePayloadBlock({ payload });

      const textBlock = this.makeTextBlock({
        text: `*ERROR*: *${serviceName}* - ${text}`,
      });

      const attachmentBlocks = [
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
    } catch (error) {
      console.error("Error sending error alert", error);
    }
  }

  // #region Table
  public async table<T>({
    text,
    headers,
    items,
    rowMapper,
    serviceName,
    alertLevel = "info",
    mentions,
  }: ITableOptions<T>) {
    try {
      if (items.length === 0) {
        await this.info({ text: "No items to process", serviceName });
        return;
      }
      // Top Level Blocks
      const mentionsBlock = await this.makeMentionsBlock({ mentions });
      const contextBlock = this.makeContextBlock({ context: this.context });
      const topLevelBlocks = [mentionsBlock, contextBlock].filter(
        (block) => block !== null
      );

      // Attachment Blocks
      const textBlock = this.makeTextBlock({
        text: `*${alertLevel.toUpperCase()}*: *${serviceName}* - ${text}`,
      });
      const rows = items.map(rowMapper);
      const table = this.makeTableBlock(headers, rows);
      const attachmentBlocks = [textBlock, table].filter(
        (block) => block !== null
      );
      const attachment = this.makeAttachment({
        color: this.getColor({ alertLevel }),
        blocks: attachmentBlocks,
      });

      await this.sendToSlack({
        attachments: [attachment],
        textOnNotification: text,
        blocks: topLevelBlocks,
      });
    } catch (error) {
      console.error("Error sending table alert", error);
    }
  }
}

export { Alert as DoNotUseThisDirectly };
export default new Alert();
