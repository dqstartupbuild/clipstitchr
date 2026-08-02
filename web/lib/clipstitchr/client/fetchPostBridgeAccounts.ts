import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";

export async function fetchPostBridgeAccounts() {
  return (await fetchPostBridgeAccountOptions()).accounts;
}
