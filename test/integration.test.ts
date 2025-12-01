import { describe, it, expect, vi, beforeEach } from "vitest";
import SlackAlert from "../src/index.js";
/**
 * Integration test - uses real Slack API
 * Run with: pnpm vitest run -t "Mention integration test"
 *
 * Requires environment variables:
 * - SLACK_MONITORING_TOKEN
 * - SLACK_MONITORING_CHANNEL_ID
 */
describe.skipIf(process.env.INTEGRATION_TESTS !== "true")("Mention integration test", () => {
  it("should mention your name in a real Slack message", async () => {
    SlackAlert.setOptions({
      token: process.env.SLACK_MONITORING_TOKEN!,
      channelId: process.env.SLACK_MONITORING_CHANNEL_ID!,
    });
    await SlackAlert.info({
      text: "Testing mention feature",
      payload: {
        userId: "123",
        action: "delete",
      },
      serviceName: "slack-alerts-test",
      mentions: ["nino"],
    });
  });
});
