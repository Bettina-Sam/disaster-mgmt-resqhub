// src/realtime.js — SHOWCASE MODE
// Mock realtime module — no socket.io connection.
// Exports a compatible API so legacy imports don't crash.

export const socket = {
  on(event, fn) { return this; },
  off(event, fn) { return this; },
  emit(event, data) { return this; },
  connect() { return this; },
  disconnect() { return this; },
  auth: {},
};

export function refreshSocketAuth() {
  // No-op in demo mode
}
