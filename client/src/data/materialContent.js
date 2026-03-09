// client/src/data/materialContent.js

// Minimal, well-structured lesson content keyed by your existing ids.
// Add more sections/rows as you like.
// Keep this file focused on content so UI can stay simple.

export const MATERIAL_CONTENT = {
  // ===== FLOOD =====
  "flood-beginner": {
    outcomes: [
      "Tell Watch vs Warning apart",
      "Build a basic go-bag",
      "Know when to evacuate safely",
    ],
    keyTerms: ["Watch", "Warning", "Go-bag", "TADD (Turn Around Don’t Drown)"],
    sections: [
      {
        title: "Watch vs Warning",
        bullets: [
          "Watch = conditions possible; prepare & monitor.",
          "Warning = occurring/imminent; move now to higher ground.",
        ],
      },
      {
        title: "Go-bag essentials",
        bullets: [
          "Water & snacks, meds for 2–3 days, torch + batteries, power bank.",
          "IDs/cash in zip pouch, first aid, whistle, spare keys.",
        ],
      },
      {
        title: "Evacuation basics",
        bullets: [
          "Share plan & pick two routes to higher ground.",
          "15–30 cm of moving water can move a car—never drive through.",
        ],
      },
    ],
    do: [
      "Charge your phone & keep power bank ready",
      "Move valuables above expected waterline",
    ],
    dont: [
      "Don’t walk/drive through floodwater",
      "Don’t touch wet electrical equipment",
    ],
    checklist: ["Go-bag near door", "Two routes known", "Neighbors informed"],
  },

  "flood-intermediate": {
    outcomes: [
      "Stage sandbags correctly",
      "Turn off mains safely",
      "Plan detours along high ground",
    ],
    keyTerms: ["Sandbag wall", "Main switch", "Detour planning"],
    sections: [
      {
        title: "Utilities",
        bullets: [
          "Know main power/gas valves and how to shut off.",
          "Turn off only if floor & hands are DRY.",
        ],
      },
      {
        title: "Sandbagging 101",
        bullets: [
          "Lay like bricks; overlap seams; protect door/vents.",
          "Leave a clear exit path for evacuation.",
        ],
      },
      {
        title: "Route planning",
        bullets: [
          "Avoid underpasses/canals; use official closures.",
          "Prefer higher-ground arterials; have a paper map.",
        ],
      },
    ],
    do: ["Keep wrench by gas valve", "Practice shutting mains in dry weather"],
    dont: ["Don’t block your exit with sandbags", "Don’t stand in water to toggle switches"],
    checklist: ["Tool ready", "Bags staged pre-monsoon", "Printed detour map"],
  },

  "flood-advanced": {
    outcomes: [
      "Organize block-level response",
      "Use simple triage categories",
      "Clean up safely after flood",
    ],
    keyTerms: ["Triage (green/yellow/red/black)", "PPE", "Mold remediation"],
    sections: [
      {
        title: "Coordination",
        bullets: [
          "Assign roles: comms, logistics, elderly support, runner.",
          "Keep a contact tree and a simple rota.",
        ],
      },
      {
        title: "Triage basics",
        bullets: [
          "Green (walking), Yellow (delayed), Red (immediate), Black (expectant).",
          "Call EMS; operate within your training.",
        ],
      },
      {
        title: "Cleanup & health",
        bullets: [
          "Wear gloves/boots/N95; ventilate well.",
          "Disinfect; discard porous items with sewage contact.",
        ],
      },
    ],
    do: ["Log needs/deliveries", "Check vulnerable neighbors daily"],
    dont: ["Don’t use generators indoors", "Don’t mix bleach & ammonia"],
    checklist: ["PPE ready", "Bleach solution correct", "Task rota posted"],
  },

  // ===== FIRE =====
  "fire-beginner": {
    outcomes: ["Make a 2-exit escape plan", "Use stop-drop-roll", "Know PASS steps"],
    keyTerms: ["PASS", "Stop-drop-roll", "Meeting point"],
    sections: [
      {
        title: "Escape plan",
        bullets: [
          "Aim for two exits per room; keep corridors clear.",
          "Pick a meeting point outside.",
        ],
      },
      {
        title: "Extinguisher (PASS)",
        bullets: [
          "Pull, Aim at base, Squeeze, Sweep.",
          "Only attempt if small and you have a clear exit.",
        ],
      },
      {
        title: "Clothes catch fire",
        bullets: ["STOP, DROP, and ROLL", "Cover face with hands while rolling"],
      },
    ],
    do: ["Practice with family", "Place extinguishers visibly"],
    dont: ["Don’t re-enter a burning building", "Don’t block exits"],
    checklist: ["Map two exits", "Extinguisher checked", "Meeting point agreed"],
  },

  "fire-intermediate": {
    outcomes: [
      "Install/test smoke & CO alarms",
      "Reduce kitchen fires",
      "Spot dangerous wiring",
    ],
    keyTerms: ["CO detector", "Grease fire lid", "Arc fault"],
    sections: [
      {
        title: "Alarms",
        bullets: [
          "Smoke alarm per bedroom area; test monthly.",
          "CO detectors near sleeping areas if gas/garage present.",
        ],
      },
      {
        title: "Kitchen",
        bullets: [
          "Stay while cooking; keep a lid nearby.",
          "Never use water on grease fires—smother with lid.",
        ],
      },
      {
        title: "Wiring & loads",
        bullets: [
          "Avoid daisy-chaining strips; replace frayed cords.",
          "Investigate frequent breaker trips.",
        ],
      },
    ],
    do: ["Replace alarm batteries yearly", "Keep lid within arm’s reach"],
    dont: ["Don’t leave cooking unattended", "Don’t overload strips"],
    checklist: ["Test alarms", "Lid near stove", "Cords inspected"],
  },

  "fire-advanced": {
    outcomes: ["Create defensible space", "Decide shelter vs evacuate", "Run drills"],
    keyTerms: ["Defensible space", "Shelter-in-place", "Fire-resistant plants"],
    sections: [
      {
        title: "Defensible space",
        bullets: [
          "Clear dry brush; 10–30 m around home per local risk.",
          "Screen vents; fire-resistant landscaping.",
        ],
      },
      {
        title: "Shelter vs evacuate",
        bullets: [
          "Follow officials; leave early if at risk.",
          "Keep go-bag, masks; car fueled.",
        ],
      },
      {
        title: "Neighborhood drills",
        bullets: ["Define roles; practice routes", "Keep contact tree/radio plan"],
      },
    ],
    do: ["Share plan with neighbors", "Clear gutters regularly"],
    dont: ["Don’t wait for visible flames to prepare", "Don’t ignore red flag days"],
    checklist: ["Brush cleared", "Go-bag ready", "Drill scheduled"],
  },

  // …Feel free to add EQ / CYCLONE / ACCIDENT sets the same way
  
};

// ===== EARTHQUAKE =====
MATERIAL_CONTENT["eq-beginner"] = {
  outcomes: [
    "Perform Drop–Cover–Hold",
    "Identify safe spots at home/school",
    "Assemble a quake-specific kit"
  ],
  keyTerms: ["Drop–Cover–Hold", "Aftershock", "Safe spot"],
  sections: [
    {
      title: "During the quake",
      bullets: [
        "DROP to hands/knees, COVER your head/neck under sturdy table, HOLD until shaking stops.",
        "If no table: get next to an interior wall and cover your head/neck."
      ]
    },
    {
      title: "Safe spots",
      bullets: [
        "Under sturdy tables/desks; away from windows, tall shelves, cabinets.",
        "Do not run outside during shaking (falling glass/debris)."
      ]
    },
    {
      title: "Quake kit basics",
      bullets: [
        "Shoes by the bed (broken glass common).",
        "Water, whistle, flashlight, gloves, basic first aid."
      ]
    }
  ],
  do: ["Practice with family", "Secure heavy items if possible", "Keep shoes by bed"],
  dont: ["Don’t stand in doorways", "Don’t use elevators"],
  checklist: ["Whistle", "Torch + batteries", "Under-table known"]
};

MATERIAL_CONTENT["eq-intermediate"] = {
  outcomes: ["Secure furniture", "Know gas shutoff", "Plan meeting points"],
  keyTerms: ["Anchors", "Gas shutoff", "Meeting point"],
  sections: [
    {
      title: "Securing furniture",
      bullets: [
        "Anchor bookshelves/wardrobes to studs.",
        "Latch cabinet doors to prevent flying contents."
      ]
    },
    {
      title: "Utilities",
      bullets: [
        "Know location of gas main; keep a suitable wrench nearby.",
        "Shut off only if you smell gas/hear hissing—wait for pro to restore."
      ]
    },
    {
      title: "Meet points & comms",
      bullets: [
        "Pick an outdoor meeting spot and an out-of-area contact.",
        "Expect cell networks to be congested; use SMS."
      ]
    }
  ],
  do: ["Tether tall furniture", "Keep gas wrench visible", "Write meet point on fridge"],
  dont: ["Don’t light matches if you smell gas", "Don’t block exits with furniture"],
  checklist: ["Anchors done", "Wrench placed", "Contacts shared"]
};

MATERIAL_CONTENT["eq-advanced"] = {
  outcomes: ["Neighborhood check-ins", "Light search awareness", "Post-event checks"],
  keyTerms: ["CERT", "Triage", "Structural hazards"],
  sections: [
    {
      title: "Block-level response",
      bullets: [
        "Check on elderly/disabled neighbors.",
        "Log needs and available resources (water/tools)."
      ]
    },
    {
      title: "Light search awareness",
      bullets: [
        "Only within your training—recognize hazards (gas, leaning walls).",
        "Mark searched areas; communicate status to responders."
      ]
    },
    {
      title: "Post-event checks",
      bullets: [
        "Look for leaning walls, large cracks, sagging roofs—evacuate if unsafe.",
        "Expect aftershocks—recheck hazards."
      ]
    }
  ],
  do: ["Use gloves/helmet if available", "Coordinate via simple roles (comms/runner)"],
  dont: ["Don’t enter visibly unstable structures", "Don’t move seriously injured unless in danger"],
  checklist: ["Neighbor list", "Log sheet", "Marking chalk/tape"]
};

// ===== ACCIDENT =====
MATERIAL_CONTENT["acc-beginner"] = {
  outcomes: ["Call for help quickly", "Make scene safe", "Prioritize basics"],
  keyTerms: ["Scene safety", "112/911", "Gloves"],
  sections: [
    {
      title: "Call first",
      bullets: [
        "Call emergency number early; give location and nature of incident.",
        "Put phone on speaker if you need hands free."
      ]
    },
    {
      title: "Make it safe",
      bullets: [
        "Switch off ignition if safe; set hazard lights; place warning triangle.",
        "Use gloves; avoid contact with blood/fluids."
      ]
    },
    {
      title: "Initial priorities",
      bullets: [
        "Check response, breathing, major bleeding.",
        "Comfort and keep warm; don’t give food/drink."
      ]
    }
  ],
  do: ["Gloves if available", "Reassure the injured", "Protect from oncoming traffic"],
  dont: ["Don’t move casualties unless in immediate danger", "Don’t crowd the scene"],
  checklist: ["Emergency number", "Triangle/torch", "Basic gloves"]
};

MATERIAL_CONTENT["acc-intermediate"] = {
  outcomes: ["Control bleeding", "Recovery position", "Recognize shock"],
  keyTerms: ["Direct pressure", "Recovery position", "Shock"],
  sections: [
    {
      title: "Bleeding control",
      bullets: [
        "Apply firm direct pressure with clean cloth; add layers if soaked—don’t remove first cloth.",
        "Raise limb if no fracture suspected."
      ]
    },
    {
      title: "Recovery position",
      bullets: [
        "If breathing but unresponsive, place on side, head tilted to maintain airway.",
        "Monitor until help arrives."
      ]
    },
    {
      title: "Shock signs",
      bullets: [
        "Pale, cool, clammy skin; fast pulse; confusion.",
        "Lay flat, lift legs slightly, keep warm—do not give food/drink."
      ]
    }
  ],
  do: ["Keep constant pressure", "Talk calmly", "Note time of events"],
  dont: ["Don’t remove embedded objects", "Don’t let them get cold"],
  checklist: ["Cloth/bandage", "Blanket/jacket", "Time noted"]
};

MATERIAL_CONTENT["acc-advanced"] = {
  outcomes: ["Simple triage concept", "Handover info", "Bystander management"],
  keyTerms: ["Triage tags", "MIST handover", "Perimeter"],
  sections: [
    {
      title: "Triage concept",
      bullets: [
        "Green/Yellow/Red/Black categories—only within your scope.",
        "Prioritize life threats; call for more resources early."
      ]
    },
    {
      title: "Handover (MIST)",
      bullets: [
        "Mechanism, Injuries, Signs (vitals), Treatment given.",
        "Keep info short & clear for responders."
      ]
    },
    {
      title: "Scene organization",
      bullets: [
        "Keep a safe perimeter; assign someone to direct traffic/bystanders.",
        "Protect privacy; avoid filming/sharing images."
      ]
    }
  ],
  do: ["Write quick notes", "Assign simple roles", "Yield space to professionals"],
  dont: ["Don’t argue on scene", "Don’t post patient images"],
  checklist: ["Notes ready", "Simple roles set", "Perimeter maintained"]
};

// ===== CYCLONE =====
MATERIAL_CONTENT["cyclone-beginner"] = {
  outcomes: [
    "Understand cyclone alert levels",
    "Assemble a household kit",
    "Prepare family & pets"
  ],
  keyTerms: ["Watch/Alert", "Warning", "Storm surge"],
  sections: [
    {
      title: "Alerts & what they mean",
      bullets: [
        "WATCH/ALERT = conditions possible → review plan, fuel vehicle, charge devices.",
        "WARNING = expected/occurring → finish prep, shelter or evacuate if told."
      ]
    },
    {
      title: "Household kit (72 hours)",
      bullets: [
        "Water (3L per person/day), non-perishable food, medications for 1 week.",
        "Power bank, flashlight, radio, spare batteries; cash and documents in zip bags."
      ]
    },
    {
      title: "Family & pets",
      bullets: [
        "Share the plan + emergency contacts; pick a check-in buddy outside the region.",
        "Pet carriers, food, meds, ID tags; know which shelters accept pets."
      ]
    }
  ],
  do: ["Follow official channels only", "Keep car tank > ½ full", "Photograph key documents"],
  dont: ["Don’t tape windows (ineffective)", "Don’t wade in floodwater"],
  checklist: ["Water stocked", "Med list + copies", "Pet carrier ready"]
};

MATERIAL_CONTENT["cyclone-intermediate"] = {
  outcomes: [
    "Harden home before landfall",
    "Choose safe room or evacuation plan",
    "Prepare vehicles & fuel"
  ],
  keyTerms: ["Boarding", "Safe room", "Go-bag"],
  sections: [
    {
      title: "Home hardening",
      bullets: [
        "Board windows/doors; bring in outdoor items; clear drains/gutters.",
        "Refrigerator to coldest setting; make ice blocks; fill bathtubs with water."
      ]
    },
    {
      title: "Safe room vs. evacuation",
      bullets: [
        "Interior room, lowest level, no windows (NOT a room that can flood).",
        "If you’re in surge/flood zone, EVACUATE early using official routes."
      ]
    },
    {
      title: "Vehicle & go-bags",
      bullets: [
        "Fuel car; map 2 routes; keep physical map.",
        "Go-bags by the door: water, snacks, meds, copies of IDs, chargers, cash."
      ]
    }
  ],
  do: ["Board windows in daylight", "Unplug small appliances", "Tell a friend your route"],
  dont: ["Don’t run generators indoors", "Don’t wait until winds start to leave"],
  checklist: ["Boards up", "Safe room picked", "Go-bags packed", "Car fueled"]
};

MATERIAL_CONTENT["cyclone-advanced"] = {
  outcomes: [
    "Execute evacuation & shelter choices",
    "Coordinate neighbors/volunteers",
    "Start safe post-storm cleanup"
  ],
  keyTerms: ["Surge zone", "Shelter-in-place", "After-action"],
  sections: [
    {
      title: "Evac & shelters",
      bullets: [
        "Leave early; avoid flooded roads; never drive through water.",
        "Know pet-friendly shelters and special-needs options; bring meds & docs."
      ]
    },
    {
      title: "Neighborhood coordination",
      bullets: [
        "Check on elders/disabled; create a simple roster (who stays, who left, needs).",
        "Share tools (saw, tarps) and information; avoid duplicate efforts."
      ]
    },
    {
      title: "Post-storm safety",
      bullets: [
        "Beware downed lines, gas smell, unstable trees/structures.",
        "Use PPE for debris; photograph damage for insurance; avoid standing water."
      ]
    }
  ],
  do: ["Tag hazards with tape/chalk", "Log who you checked on and when", "Use buddy system"],
  dont: ["Don’t run chainsaws without PPE/training", "Don’t enter buildings with structural damage"],
  checklist: ["Shelter plan", "Neighborhood roster", "PPE (gloves, boots, goggles)"]
};
