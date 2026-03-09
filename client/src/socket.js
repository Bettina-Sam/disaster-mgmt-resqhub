// src/socket.js — SHOWCASE MODE
// Real socket.io removed. Returns a mock event emitter that silently no-ops.

const mockSocket = {
  _listeners: {},
  on(event, fn) { return this; },
  off(event, fn) { return this; },
  emit(event, data) { return this; },
  connect() { return this; },
  disconnect() { return this; },
  auth: {},
};

export default mockSocket;
