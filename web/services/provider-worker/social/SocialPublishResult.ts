export type SocialPublishResult =
  | {
      publicationIds: string[];
      providerResponseJson?: string;
      state: "published";
      permalink?: string;
      awaitingUser?: boolean;
    }
  | {
      nextStatusCheckAt: string;
      providerPublishId?: string;
      state: "status_check";
    };
