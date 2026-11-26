declare const pages: Record<string, [string, string]>;
declare const mediaIds: Set<string>;
declare const lessonFiles: Record<string, string>;
export default {
  async fetch(request: Request) {
    const pathname = new URL(request.url).pathname;
    const path =
      /^\/courses\/(cybersecurity|bug-bounty)\/(path|milestones|resources)\/?$/.test(
        pathname,
      ) || ["/bug-bounty", "/bug-bounty/"].includes(pathname)
        ? "/"
        : pathname;
    if (!["GET", "HEAD"].includes(request.method))
      return new Response(null, { status: 405 });
    if (Object.hasOwn(pages, path)) {
      const [type, body] = pages[path];
      if (type === "image/webp") {
        const bytes =
          request.method === "HEAD"
            ? null
            : Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
        return new Response(bytes, {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
      return new Response(request.method === "HEAD" ? null : body, {
        headers: { "Content-Type": type + "; charset=utf-8" },
      });
    }
    const match = /^\/lesson-files\/([\w-]+)\/(preview|download)$/.exec(path);
    if (match) {
      const [, fileId, action] = match;
      if (!Object.hasOwn(lessonFiles, fileId))
        return new Response(null, { status: 404 });
      const url =
        "https://drive.usercontent.google.com/download?export=download&confirm=t&id=" +
        fileId;
      let source;
      try {
        source = await fetch(url, { method: request.method });
      } catch {}
      if (
        !source?.ok ||
        /text\/html/i.test(source.headers.get("content-type") || "")
      ) {
        return new Response(
          "This file is temporarily unavailable. Please try again.",
          {
            status: 502,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          },
        );
      }
      const headers = new Headers({
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      });
      if (action === "download") {
        headers.set("Content-Type", "application/octet-stream");
        headers.set(
          "Content-Disposition",
          "attachment; filename*=UTF-8''" +
            encodeURIComponent(lessonFiles[fileId]),
        );
      }
      return new Response(source.body, { headers });
    }
    const id = path.startsWith("/media/") ? path.slice(7) : "";
    if (!mediaIds.has(id)) return new Response(null, { status: 404 });
    const headers = new Headers();
    const range = request.headers.get("Range");
    if (range) headers.set("Range", range);
    const source =
      "https://drive.usercontent.google.com/download?export=download&confirm=t&id=" +
      id;
    const result = await fetch(source, { method: request.method, headers });
    if (result.status === 416)
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": result.headers.get("Content-Range") || "bytes */*",
        },
      });
    if (
      !result.ok ||
      !/^(video\/|application\/octet-stream)/i.test(
        result.headers.get("Content-Type") || "",
      )
    )
      return new Response(null, { status: 502 });
    const responseHeaders = new Headers({
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
    });
    for (const key of [
      "Content-Length",
      "Content-Range",
      "ETag",
      "Last-Modified",
    ]) {
      const value = result.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    return new Response(result.body, {
      status: result.status,
      headers: responseHeaders,
    });
  },
};
