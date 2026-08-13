export type InstagramAccountSelection = Readonly<{
  accountId: string;
  pageId: string;
  accountName: string;
  username: string | undefined;
  pictureUrl: string | undefined;
  pageAccessToken: string;
}>;
