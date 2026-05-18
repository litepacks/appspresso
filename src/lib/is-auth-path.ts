/** Exact `/auth` or `/auth/...` to avoid false positives like `/author` */
export function isAuthPath(pathname: string): boolean {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

/** Exact `/auth/login` or `.../auth/login` segment in path (safe under basename). */
export function isAuthLoginPath(pathname: string): boolean {
  return /(^|\/)auth\/login\/?$/.test(pathname);
}
