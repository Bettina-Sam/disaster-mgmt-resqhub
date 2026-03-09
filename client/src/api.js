// src/api.js — SHOWCASE MODE
// Backend removed. This stub prevents crashes from any leftover api.* calls.
const WARN = (method, url) =>
  console.warn(`[ResQHub Demo] api.${method}("${url}") — backend disabled, using mock service instead.`);

const stub = (method) => (url, data) => {
  WARN(method, url);
  return Promise.resolve({ data: null });
};

const api = {
  get: stub("get"),
  post: stub("post"),
  put: stub("put"),
  patch: stub("patch"),
  delete: stub("delete"),
};

export default api;
