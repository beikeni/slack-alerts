import { vi, type Mock } from "vitest";
import { DoNotUseThisDirectly } from "../src/index.js";
import type { WebClient } from "@slack/web-api";

export class TestableAlert extends DoNotUseThisDirectly {
  public mockPostMessage: Mock = vi.fn();
  public mockJoinConversation: Mock = vi.fn();
  public mockUsersList: Mock = vi.fn();

  protected createSlackClient(): WebClient {
    return {
      chat: {
        postMessage: this.mockPostMessage,
      },
      conversations: {
        join: this.mockJoinConversation,
      },
      users: {
        list: this.mockUsersList,
      },
    } as unknown as WebClient;
  }
}
