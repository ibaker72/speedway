import { cookies } from "next/headers";

const COOKIE_NAME = "speedway_admin_session";

export function getAdminPassword() {
  const password = process.env.DEAL_DESK_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("DEAL_DESK_ADMIN_PASSWORD environment variable must be set. No default password is allowed in production.");
  }
  return password;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === getAdminPassword();
}

export { COOKIE_NAME };
