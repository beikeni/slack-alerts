import { WebClient, type MessageAttachment } from "@slack/web-api";

export class CoreAlert {
  protected token: string;
  protected channelId: string;
  protected slackClient: WebClient;

  constructor(options?: { token?: string; channelId?: string }) {
    this.token = options?.token ?? process.env.SLACK_MONITORING_TOKEN!;
    this.channelId =
      options?.channelId ?? process.env.SLACK_MONITORING_CHANNEL_ID!;

    if (!this.token) {
      console.debug(
        "SlackAlerts: No token provided. Please provide a token using the setCredentials method or environment variable SLACK_MONITORING_TOKEN"
      );
    }
    if (!this.channelId) {
      console.debug(
        "SlackAlerts: No channel ID provided. Please provide a channel ID using the setCredentials method or environment variable SLACK_MONITORING_CHANNEL_ID"
      );
    }

    this.slackClient = this.createSlackClient();
  }

  /**
   * Set the options for the Slack client and channel ID.
   * Alternatively, you can set the options using environment variables:
   * - SLACK_MONITORING_TOKEN
   * - SLACK_MONITORING_CHANNEL_ID
   *
   * The options can be set individually
   * @param options - The options to set
   * @param options.token - The Slack token
   * @param options.channelId - The channel ID
   */
  public setOptions(options: { token: string; channelId: string }) {
    if (!options.token) {
      if (!this.token) throw new Error("Token and channel ID are required");
    }
    if (!options.channelId) {
      if (!this.channelId) throw new Error("Channel ID is required");
    }
    this.token = options.token ?? this.token;
    this.channelId = options.channelId ?? this.channelId;
    this.slackClient = this.createSlackClient();
  }

  protected createSlackClient(): WebClient {
    return new WebClient(this.token);
  }

  protected async sendToSlack({
    attachments,
    textOnNotification,
    blocks,
  }: {
    attachments: MessageAttachment[];
    textOnNotification: string;
    blocks?: any[] | undefined;
  }) {
    try {
      await this.slackClient.chat.postMessage({
        channel: this.channelId,
        attachments,
        text: textOnNotification,
        blocks,
      });
    } catch (err: any) {
      if (err.data?.error === "not_in_channel") {
        await this.slackClient.conversations.join({ channel: this.channelId });
        await this.sendToSlack({
          attachments,
          textOnNotification,
          blocks,
        });
      }
      console.error("Failed to send message to Slack", err);
      console.log(JSON.stringify(attachments, null, 2));
      console.log(JSON.stringify(textOnNotification, null, 2));
      console.log(JSON.stringify(blocks, null, 2));
    }
  }
}
