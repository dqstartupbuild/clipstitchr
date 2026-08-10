import { fetchSocialPublishingAccountOptions } from "@/lib/clipstitchr/client/fetchSocialPublishingAccountOptions";

export async function fetchSocialPublishingAccounts() {
  return (await fetchSocialPublishingAccountOptions()).accounts;
}
