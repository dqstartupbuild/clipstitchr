export type DashboardNotification = {
  id: string;
  title: string;
  preview: string;
  message: string;
  sourceType: string;
  sourceId?: string;
  productId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
};
