"use client";

import { createClient } from "@/lib/supabase/client";

const SESSION_STORAGE_KEY = "tezkorusta_session_id";

export type AnalyticsEventType =
  | "page_view"
  | "job_request_created"
  | "listing_view"
  | "favorite_added"
  | "pwa_install_prompt"
  | "pwa_installed";

function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}

export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata: Record<string, unknown> = {},
  path?: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const eventPath = path ?? `${window.location.pathname}${window.location.search}`;
  const sessionId = getSessionId();

  const { error } = await supabase.from("app_events").insert({
    user_id: user?.id ?? null,
    event_type: eventType,
    path: eventPath,
    metadata: {
      ...metadata,
      session_id: sessionId,
    },
  });

  if (error) {
    console.error("Analytics event failed:", error);
  }
}
