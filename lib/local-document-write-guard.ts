function isLoopback(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function canWriteDemoDocuments(request: Request) {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./forma-dev.db";
  if (process.env.NODE_ENV !== "development" || databaseUrl !== "file:./forma-dev.db") return false;
  try {
    const requestUrl = new URL(request.url);
    const host = request.headers.get("host");
    const origin = request.headers.get("origin");
    const hostName = host ? new URL(`http://${host}`).hostname : null;
    if (!isLoopback(requestUrl.hostname) || (hostName && !isLoopback(hostName))) return false;
    return !origin || isLoopback(new URL(origin).hostname);
  } catch {
    return false;
  }
}
