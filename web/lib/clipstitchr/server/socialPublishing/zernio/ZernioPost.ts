export type ZernioPost = {
  _id: string;
  content?: string;
  createdAt?: string;
  isDraft?: boolean;
  platforms?: {
    accountId?: string | { _id?: string };
  }[];
  publishedAt?: string;
  scheduledFor?: string;
  status?: string;
  updatedAt?: string;
};
