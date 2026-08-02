import type { ServiceAssertionAction } from "@/services/publishing-service/src/assertions/ServiceAssertionAction";

export type PublishingServiceRequestInput = Readonly<{
  action: ServiceAssertionAction;
  body?: unknown;
  method: "DELETE" | "GET" | "PATCH" | "POST";
  path: string;
  searchParams?: Readonly<Record<string, string>>;
}>;
