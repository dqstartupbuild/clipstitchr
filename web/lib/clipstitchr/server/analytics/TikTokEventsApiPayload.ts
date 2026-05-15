export type TikTokEventsApiPayload = {
  data: Array<{
    event: string;
    event_id: string;
    event_time: number;
    page?: {
      referrer?: string;
      url?: string;
    };
    properties?: Record<string, unknown>;
    user: {
      email?: string;
      external_id?: string;
      ip?: string;
      phone?: string;
      ttclid?: string;
      ttp?: string;
      user_agent?: string;
    };
  }>;
  event_source: "web";
  event_source_id: string;
  test_event_code?: string;
};
