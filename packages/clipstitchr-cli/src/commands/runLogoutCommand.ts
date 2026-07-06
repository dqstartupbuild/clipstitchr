import { logout } from "../auth/logout.js";

export async function runLogoutCommand() {
  await logout();
  console.log("Logged out.");
}
