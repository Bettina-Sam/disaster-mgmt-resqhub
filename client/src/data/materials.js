// client/src/data/materials.js

export const DISASTERS = ["FLOOD", "FIRE", "EARTHQUAKE", "CYCLONE", "ACCIDENT"];

const mk = (id, disaster, level, title, duration, badge, summary, tags, hero) => ({
  id, disaster, level, title, duration, badge, summary, tags, hero,
});

export const MATERIALS = [
  // FLOOD
  mk("flood-beginner","FLOOD","BEGINNER","Flood Safety — Beginner",25,"Flood Novice",
     "Basics of flood awareness, home prep, and simple evacuation planning.",
     ["Home prep","Go-bag","Evacuation","Kids"], "🌊"),
  mk("flood-intermediate","FLOOD","INTERMEDIATE","Flood Safety — Intermediate",30,"Flood Ready",
     "Reading warnings, sandbagging, turning off utilities, and moving valuables.",
     ["Warnings","Sandbags","Utilities","Pets"], "🌊"),
  mk("flood-advanced","FLOOD","ADVANCED","Flood Safety — Advanced",35,"Flood Pro",
     "Community response, triage basics, relief coordination, and post-flood cleanup.",
     ["Community","Triage","Coordination","Cleanup"], "🌊"),

  // FIRE
  mk("fire-beginner","FIRE","BEGINNER","Fire Safety — Beginner",20,"Fire Novice",
     "How fires spread, escape routes, stop-drop-roll, and extinguisher basics.",
     ["Escape plan","Extinguisher","Stop-drop-roll","Kids"], "🔥"),
  mk("fire-intermediate","FIRE","INTERMEDIATE","Fire Safety — Intermediate",28,"Fire Ready",
     "Smoke alarms, CO detectors, kitchen safety, and safe appliance usage.",
     ["Alarms","Kitchen safety","CO","Wiring"], "🔥"),
  mk("fire-advanced","FIRE","ADVANCED","Fire Safety — Advanced",35,"Fire Pro",
     "Wildfire prep, defensible space, shelter-in-place, and neighborhood drills.",
     ["Wildfire","Defensible space","Drills","Shelter"], "🔥"),

  // EARTHQUAKE
  mk("eq-beginner","EARTHQUAKE","BEGINNER","Earthquake Safety — Beginner",22,"Quake Novice",
     "Drop-Cover-Hold, safe spots, and emergency kits tailored to quakes.",
     ["Drop-Cover-Hold","Safe spots","Quake kit","Family plan"], "🌍"),
  mk("eq-intermediate","EARTHQUAKE","INTERMEDIATE","Earthquake Safety — Intermediate",30,"Quake Ready",
     "Securing furniture, gas shutoff, community meeting points.",
     ["Furniture","Gas shutoff","Meet points","Shoes by bed"], "🌍"),
  mk("eq-advanced","EARTHQUAKE","ADVANCED","Earthquake Safety — Advanced",36,"Quake Pro",
     "CERT basics, light search & rescue, and post-event building checks.",
     ["CERT","Light SAR","Building checks","Comms"], "🌍"),

  // CYCLONE
  mk("cyclone-beginner","CYCLONE","BEGINNER","Cyclone Safety — Beginner",24,"Cyclone Novice",
     "Understanding alerts, assembling kits, and household readiness.",
     ["Alerts","Water","Food","Medication"], "🌀"),
  mk("cyclone-intermediate","CYCLONE","INTERMEDIATE","Cyclone Safety — Intermediate",30,"Cyclone Ready",
     "Boarding windows, safe rooms, and vehicle & fuel planning.",
     ["Board windows","Safe room","Fuel","Docs"], "🌀"),
  mk("cyclone-advanced","CYCLONE","ADVANCED","Cyclone Safety — Advanced",38,"Cyclone Pro",
     "Evac operations, shelter networks, and volunteer coordination.",
     ["Evac routes","Shelters","Coordination","Aftercare"], "🌀"),

  // ACCIDENT
  mk("acc-beginner","ACCIDENT","BEGINNER","Accident Response — Beginner",18,"Responder Novice",
     "Calling help, scene safety, and basic first-aid priorities.",
     ["Call 112","Scene safety","Gloves","Comfort"], "🚑"),
  mk("acc-intermediate","ACCIDENT","INTERMEDIATE","Accident Response — Intermediate",26,"Responder Ready",
     "Bleeding control, recovery position, shock recognition.",
     ["Bleeding","Recovery","Shock","Reassure"], "🚑"),
  mk("acc-advanced","ACCIDENT","ADVANCED","Accident Response — Advanced",34,"Responder Pro",
     "Triage intro, patient hand-off, and bystander coordination.",
     ["Triage","Handover","Bystanders","Notes"], "🚑"),
];

// Helper: group by disaster for rendering sections
export const byDisaster = MATERIALS.reduce((acc, m) => {
  (acc[m.disaster] ||= []).push(m);
  return acc;
}, {});
