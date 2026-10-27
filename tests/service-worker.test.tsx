import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

type WorkerEvent = {
  request?: { method: string; url: string; mode: string };
  respondWith?: (response: Promise<Response>) => void;
  waitUntil?: (promise: Promise<unknown>) => void;
};

function createServiceWorkerHarness() {
  const listeners = new Map<string, (event: WorkerEvent) => void>();
  const cache = {
    addAll: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
  };
  const caches = {
    open: vi.fn().mockResolvedValue(cache),
    match: vi.fn().mockResolvedValue(undefined),
    keys: vi.fn().mockResolvedValue([] as string[]),
    delete: vi.fn().mockResolvedValue(true),
  };
  const fetch = vi.fn().mockResolvedValue(new Response("ok"));
  const self = {
    location: { origin: "https://forma.example" },
    clients: { claim: vi.fn().mockResolvedValue(undefined) },
    skipWaiting: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn((type: string, listener: (event: WorkerEvent) => void) => {
      listeners.set(type, listener);
    }),
  };
  const source = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

  runInNewContext(source, { self, caches, fetch, URL, Response });
  return { listeners, cache, caches, fetch };
}

describe("team library service worker cache boundary", () => {
  it("pre-caches only the offline shell and public app metadata", async () => {
    const { listeners, cache, caches } = createServiceWorkerHarness();
    const waitUntil = vi.fn<(promise: Promise<unknown>) => void>();

    listeners.get("install")?.({ waitUntil });
    await waitUntil.mock.calls[0][0];

    expect(caches.open).toHaveBeenCalledWith("forma-shell-v2");
    expect(cache.addAll).toHaveBeenCalledWith([
      "/offline",
      "/manifest.webmanifest",
      "/icon.svg",
    ]);
  });

  it("removes prior Forma shell caches without deleting another app's cache", async () => {
    const { listeners, caches } = createServiceWorkerHarness();
    caches.keys.mockResolvedValue(["forma-shell-v1", "another-app-cache"]);
    const waitUntil = vi.fn<(promise: Promise<unknown>) => void>();

    listeners.get("activate")?.({ waitUntil });
    await waitUntil.mock.calls[0][0];

    expect(caches.delete).toHaveBeenCalledOnce();
    expect(caches.delete).toHaveBeenCalledWith("forma-shell-v1");
  });

  it("never intercepts API responses or caches dynamic navigation", async () => {
    const { listeners, cache, fetch } = createServiceWorkerHarness();
    const onFetch = listeners.get("fetch");
    const apiRespondWith = vi.fn<(response: Promise<Response>) => void>();
    const apiEvent = {
      request: { method: "GET", url: "https://forma.example/api/documents", mode: "cors" },
      respondWith: apiRespondWith,
    };
    onFetch?.(apiEvent);

    expect(apiRespondWith).not.toHaveBeenCalled();

    const navigationRespondWith = vi.fn<(response: Promise<Response>) => void>();
    const navigationEvent = {
      request: { method: "GET", url: "https://forma.example/documents", mode: "navigate" },
      respondWith: navigationRespondWith,
    };
    onFetch?.(navigationEvent);
    await navigationRespondWith.mock.calls[0][0];

    expect(fetch).toHaveBeenCalledOnce();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("caches a successful Next.js static asset", async () => {
    const { listeners, cache } = createServiceWorkerHarness();
    const respondWith = vi.fn<(response: Promise<Response>) => void>();
    const waitUntil = vi.fn<(promise: Promise<unknown>) => void>();
    const event = {
      request: {
        method: "GET",
        url: "https://forma.example/_next/static/app.js",
        mode: "same-origin",
      },
      respondWith,
      waitUntil,
    };
    listeners.get("fetch")?.(event);
    await respondWith.mock.calls[0][0];
    await waitUntil.mock.calls[0][0];

    expect(cache.put).toHaveBeenCalledOnce();
  });
});
