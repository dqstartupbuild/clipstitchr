import { logout } from "../auth/logout.js";
import { logSuccess } from "../terminal/logSuccess.js";

export async function runLogoutCommand() {
  await logout();
  logSuccess("Logged out.");
}
