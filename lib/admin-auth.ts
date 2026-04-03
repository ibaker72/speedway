import { cookies } from "next/headers";

const COOKIE_NAME = "speedway_admin_session";

export function getAdminPassword() {
  return process.env.DEAL_DESK_ADMIN_PASSWORD || "speedway-internal";
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === getAdminPassword();
}

export { COOKIE_NAME };
