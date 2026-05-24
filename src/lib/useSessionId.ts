"use client";
import { useEffect, useState } from "react";

export function useSessionId(): string | null {
  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    let id = localStorage.getItem("mp_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("mp_session_id", id);
    }
    setSessionId(id);
  }, []);
  return sessionId;
}
