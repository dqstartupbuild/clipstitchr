import type { ServiceAssertionAction } from "@clipstitchr/publishing-service";

export type PublishingServiceRequestInput = Readonly<{
  action: ServiceAssertionAction;
  body?: unknown;
  method: "DELETE" | "GET" | "PATCH" | "POST";
  path: string;
  searchParams?: Readonly<Record<string, string>>;
}>;
