// src/services/mockService.js
// Mock async service layer — replaces backend API entirely
// Simulates realistic async delays for demo realism

import { SEED_INCIDENTS, MOCK_ALERTS, MOCK_SHELTERS, MOCK_RESCUE_TEAMS, MOCK_CONTACTS, MOCK_DASHBOARD_STATS } from "../mock/mockData";

// In-memory store (initialized from seed)
let _incidents = [...SEED_INCIDENTS];

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ─── Incidents ───────────────────────────────
export async function getIncidents() {
  await delay(300);
  return [..._incidents];
}

export async function createIncident(data) {
  await delay(350);
  const newDoc = {
    ...data,
    _id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reportedBy: data.reportedBy || "Web Reporter",
    rescueTeam: "Dispatching...",
    responseETA: "Calculating...",
  };
  _incidents = [newDoc, ..._incidents];
  return newDoc;
}

export async function updateIncident(id, updates) {
  await delay(200);
  _incidents = _incidents.map((x) =>
    x._id === id ? { ...x, ...updates, updatedAt: new Date().toISOString() } : x
  );
  return _incidents.find((x) => x._id === id);
}

export async function deleteIncident(id) {
  await delay(200);
  _incidents = _incidents.filter((x) => x._id !== id);
  return { success: true };
}

// ─── Alerts ──────────────────────────────────
export async function getAlerts() {
  await delay(200);
  return [...MOCK_ALERTS];
}

// ─── Shelters ────────────────────────────────
export async function getShelters() {
  await delay(200);
  return [...MOCK_SHELTERS];
}

// ─── Rescue Teams ────────────────────────────
export async function getRescueTeams() {
  await delay(200);
  return [...MOCK_RESCUE_TEAMS];
}

// ─── Emergency Contacts ──────────────────────
export async function getEmergencyContacts() {
  await delay(150);
  return [...MOCK_CONTACTS];
}

// ─── Dashboard Stats ─────────────────────────
export async function getDashboardStats() {
  await delay(250);
  // Compute live from current incidents + seed values
  const critical = _incidents.filter((x) => x.severity === "CRITICAL").length;
  return {
    ...MOCK_DASHBOARD_STATS,
    totalIncidentsToday: _incidents.length,
    criticalOpen: critical,
  };
}

// ─── Visitor Counter (session-based) ─────────
export function incrementVisitorCount() {
  const key = "rsqhub:visitors";
  const sessionKey = "rsqhub:visited";
  // Only count once per browser session
  if (sessionStorage.getItem(sessionKey)) {
    return parseInt(localStorage.getItem(key) || "1", 10);
  }
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  const updated = current + 1;
  localStorage.setItem(key, String(updated));
  sessionStorage.setItem(sessionKey, "1");
  return updated;
}

export function getVisitorCount() {
  return parseInt(localStorage.getItem("rsqhub:visitors") || "1", 10);
}
