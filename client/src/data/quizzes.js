
// client/src/data/quizzes.js

export const DISASTERS = ["FLOOD","FIRE","EARTHQUAKE","CYCLONE","ACCIDENT"];
export const LEVELS = ["BEGINNER","INTERMEDIATE","ADVANCED"];
export const DISASTER_EMOJI = {
  FLOOD: "🌊", FIRE: "🔥", EARTHQUAKE: "💥", CYCLONE: "🌀", ACCIDENT: "🚑"
};

const mcq = (q, choices, answer, explain) => ({ type: "MCQ", q, choices, answer, explain });
const tf  = (q, answer, explain) => ({ type: "TF", q, answer, explain });

const mk = (id, title, disaster, level, passingScore, timeLimit, questions) => ({
  id, title, disaster, level, passingScore, timeLimit, questions,
});

/* ------------------------- FLOOD ------------------------- */
const FLOOD_BEGINNER = mk("flood-beginner", "Flood Safety — Beginner", "FLOOD", "BEGINNER", 70, 0, [
  mcq("What’s the first action during a flood warning?",
    ["Drive to check river", "Pack go-bag & follow plan", "Move furniture", "Turn on lights"], 1,
    "Warnings mean act now: grab essentials and follow your plan."),
  mcq("A go-bag should include which three items at minimum?",
    ["Books, plants, laptop", "Water, first-aid kit, flashlight", "Paint, rope, speakers", "Coffee machine, iron, candles"], 1,
    "Water + first-aid + light are core life-safety items."),
  mcq("Best place for important documents before a flood?",
    ["Bottom kitchen drawer", "Waterproof pouch in your go-bag", "Garage shelf", "Coffee table"], 1,
    "Keep documents sealed and portable."),
  mcq("If water is entering your home, first you should:",
    ["Turn off power at main (if safe)", "Unplug items one by one", "Wipe floors", "Light candles"], 0,
    "Cut power (if safe) to reduce electrocution risk."),
  mcq("“Turn around, don’t drown” means:",
    ["Drive slowly through water", "Walk beside car to test depth", "Never drive/walk through floodwater", "Only small cars stop"], 2,
    "Even shallow moving water can sweep away cars and people."),
  mcq("Pets during evacuation should be:",
    ["Left with food", "Brought with carriers & ID", "Released outside", "Fed chocolate"], 1,
    "Pets must evacuate with you and have proper ID."),
]);

const FLOOD_INTERMEDIATE = mk("flood-intermediate", "Flood Safety — Intermediate", "FLOOD", "INTERMEDIATE", 70, 0, [
  mcq("Sandbags are most effective when placed:",
    ["Anywhere near door", "Staggered rows with plastic inward", "Standing vertically", "Filled to top & tied tightly"], 1,
    "Staggered rows + plastic sheeting help control seepage."),
  mcq("Good evacuation routes:",
    ["Follow rivers", "Avoid low/underpass areas", "Most scenic", "Biggest bridge"], 1,
    "Low areas flood first; underpasses trap water."),
  mcq("Before evacuating, utilities should be:",
    ["Ignored", "Turned off at main if instructed and safe", "Turned to full power", "Only water off"], 1,
    "Shutoffs reduce fire/electrocution/explosion risks."),
  mcq("If stuck in a car with rising water, safest action:",
    ["Stay & call friend", "Drive faster", "Unbuckle, open/break window, evacuate to higher ground", "Wait for engine to stall"], 2,
    "Exiting quickly can save your life."),
  mcq("PPE for shallow water:",
    ["Flip-flops", "Barefoot", "Thick boots, gloves, long sleeves", "Dress shoes"], 2,
    "Protect against debris and contamination."),
  mcq("A safe family rally point:",
    ["Basement", "Low ground near stream", "Higher, open area away from flood zones", "Under a bridge"], 2,
    "High, open areas are safer and easy to find."),
]);

const FLOOD_ADVANCED = mk("flood-advanced", "Flood Safety — Advanced", "FLOOD", "ADVANCED", 70, 0, [
  mcq("River gauge rapid rise + heavy upstream rain indicates:",
    ["Stable levels", "Flash-flood risk downstream", "Drought", "Safe fishing"], 1,
    "Upstream input + rapid rise = downstream danger."),
  mcq("During boat rescue you should:",
    ["Wave wildly & grab anywhere", "Stay calm, follow commands, board as instructed", "Jump in quickly", "Tie your bag to a rope"], 1,
    "Controlled movements keep everyone safe."),
  mcq("After a flood, a top home health risk is:",
    ["Mild dust", "Mold & contaminated residue", "Cold air", "Carpet smell"], 1,
    "Moisture + contamination = mold + pathogens."),
  mcq("Before re-entering home you should:",
    ["Enter immediately", "Wait for authorities & utility checks", "Open all gas lines", "Use a lighter in basement"], 1,
    "Structural, gas, and electrical checks are critical."),
  mcq("Handling soaked drywall/insulation:",
    ["Dry with heater", "Remove & discard if soaked/contaminated", "Paint over", "Bleach only"], 1,
    "Porous, contaminated materials must be removed."),
  mcq("Insurance documentation should include:",
    ["One selfie", "Detailed photos/videos, serials, receipts, timeline", "Sketch", "Verbal only"], 1,
    "Thorough, time-stamped evidence speeds claims."),
]);

/* ------------------------- FIRE ------------------------- */
const FIRE_BEGINNER = mk("fire-beginner", "Fire Safety — Beginner", "FIRE", "BEGINNER", 70, 0, [
  mcq("First step if a smoke alarm sounds at night:",
    ["Check phone", "Investigate slowly", "Wake everyone & evacuate to the rally point", "Open all windows"], 2,
    "Get everyone out fast to a known location."),
  mcq("Best extinguisher technique for small fires:",
    ["Aim at flames' top", "Spray randomly", "PASS: Pull, Aim at base, Squeeze, Sweep", "Throw the can"], 2,
    "PASS is the standard extinguisher method."),
  mcq("Stop, drop, and roll is used when:",
    ["Hair is wet", "Clothes catch fire", "There is heavy smoke only", "Cooking"], 1,
    "It smothers flames on clothing."),
  mcq("If a doorknob is hot during a fire:",
    ["Open quickly", "Leave it & find another exit", "Pour water then open", "Wait it out"], 1,
    "Hot door = fire likely behind it."),
  mcq("Cooking safety includes:",
    ["Leaving stove unattended", "Keeping flammables away", "Wearing loose sleeves", "Overfilled pans"], 1,
    "Keep combustibles away; stay focused."),
  mcq("Best place for home fire rally point:",
    ["Inside kitchen", "Neighboring open area/tree", "Basement", "Balcony"], 1,
    "Pick an obvious outdoor location everyone knows."),
]);

const FIRE_INTERMEDIATE = mk("fire-intermediate", "Fire Safety — Intermediate", "FIRE", "INTERMEDIATE", 70, 0, [
  mcq("Correct smoke alarm setup:",
    ["One in kitchen only", "In bedrooms and hallways, tested monthly", "Only in living room", "None needed"], 1,
    "Bedrooms/halls; test & replace batteries regularly."),
  mcq("CO detector purpose:",
    ["Detects smoke", "Detects carbon monoxide gas", "Detects heat", "Detects dust"], 1,
    "CO is odorless and deadly."),
  mcq("If trapped by smoke:",
    ["Stand tall & run", "Stay low, cover mouth, find alternate exit", "Break windows immediately", "Hide in closet"], 1,
    "Smoke rises; crawl low to breathe."),
  mcq("Electrical fire safety:",
    ["Use water", "Overload power strips", "Use class C-rated extinguishers", "Ignore frayed wires"], 2,
    "Class C for energized equipment; fix faulty wiring."),
  mcq("Apartment stairwell safety:",
    ["Use elevator", "Use stairs, never elevator", "Hide in laundry room", "Wait for neighbors"], 1,
    "Elevators can fail; stairs are safer."),
  mcq("Kitchen grease fire:",
    ["Pour water", "Smother with lid and turn off heat", "Move pan outside", "Add alcohol"], 1,
    "Water spreads burning oil; smother instead."),
]);

const FIRE_ADVANCED = mk("fire-advanced", "Fire Safety — Advanced", "FIRE", "ADVANCED", 70, 0, [
  mcq("Wildfire prep best practice:",
    ["Trees against house", "Clear defensible space & remove dry brush", "Store propane indoors", "Wood roof"], 1,
    "Defensible space helps stop fire spread."),
  mcq("Shelter-in-place choice during wildfire smoke:",
    ["Open windows", "Close windows/doors, filter air, stay inside", "Go jogging", "Run sprinklers"], 1,
    "Seal home and filter indoor air."),
  mcq("Evacuating vulnerable persons:",
    ["Later last", "Plan transport & meds early", "No meds needed", "Let them stay"], 1,
    "Early planning saves lives."),
  mcq("Post-fire hazards include:",
    ["Clean air guaranteed", "Hot spots, toxic residues, unstable structures", "No electrical risk", "Safe wiring"], 1,
    "Assume hazards remain until inspected."),
  mcq("Extinguisher types: ABC means:",
    ["Any fire", "Solid, liquid, electrical", "Air, battery, cable", "None"], 1,
    "A: solids, B: liquids, C: electrical."),
  mcq("Insurance + inventory:",
    ["No photos needed", "Photo/video inventory with receipts & serials", "Only receipts", "Memory only"], 1,
    "Evidence speeds claims and recovery."),
]);

/* ---------------------- EARTHQUAKE ---------------------- */
const EQ_BEGINNER = mk("eq-beginner", "Earthquake Safety — Beginner", "EARTHQUAKE", "BEGINNER", 70, 0, [
  mcq("During shaking, you should:",
    ["Run outside", "Stand in doorway", "Drop, Cover, Hold On", "Jump on bed"], 2,
    "DCH protects from falling objects."),
  mcq("Safe spots include:",
    ["Under sturdy table/desk", "Next to glass cabinet", "Balcony edge", "Beside tall shelves"], 0,
    "Sturdy furniture protects from debris."),
  mcq("Emergency kit add-on for quakes:",
    ["Heels", "Work gloves & sturdy shoes", "Big mirror", "Perfume"], 1,
    "Protect feet & hands from debris."),
  mcq("If indoors during quake:",
    ["Run to stairs", "Use elevator", "Stay put under cover until shaking stops", "Jump from window"], 2,
    "Stay and shelter until it’s safe to move."),
  mcq("If you’re in bed:",
    ["Run outside", "Cover your head with pillow and stay put", "Stand near wardrobe", "Go to kitchen"], 1,
    "Protect head/neck; avoid moving during shaking."),
  mcq("After shaking stops, first do:",
    ["Turn on gas", "Check for injuries, hazards, and aftershocks", "Play music", "Take bath"], 1,
    "Assess safety and prepare for aftershocks."),
]);

const EQ_INTERMEDIATE = mk("eq-intermediate", "Earthquake Safety — Intermediate", "EARTHQUAKE", "INTERMEDIATE", 70, 0, [
  mcq("Prevent furniture tip-overs by:",
    ["Ignoring it", "Securing to studs/walls", "Adding wheels", "Leaning forward"], 1,
    "Anchor tall items to prevent crush injuries."),
  mcq("Gas shutoff knowledge:",
    ["Not needed", "Know how to shut gas if leak suspected and it’s safe", "Always shut immediately", "Only utility can shut"], 1,
    "Only shut if leak suspected; learn the valve."),
  mcq("Aftershock behavior:",
    ["Go sightseeing", "Expect aftershocks; re-check hazards", "Ignore alarms", "Use elevators"], 1,
    "Aftershocks can damage weakened structures."),
  mcq("Meet-up planning:",
    ["None", "Set multiple contact points and an out-of-area contact", "Phone only", "DMs only"], 1,
    "Redundancy helps when networks fail."),
  mcq("If outside among buildings:",
    ["Stay by walls", "Move to open area away from facades", "Stand under signs", "Under power lines"], 1,
    "Avoid falling glass/masonry."),
  mcq("Driving during quake:",
    ["Speed up", "Stop safely, stay in vehicle, avoid bridges", "Stop under overpass", "Brake in tunnel"], 1,
    "Avoid structures that could fail."),
]);

const EQ_ADVANCED = mk("eq-advanced", "Earthquake Safety — Advanced", "EARTHQUAKE", "ADVANCED", 70, 0, [
  mcq("Light search & rescue priority:",
    ["Self-safety, call it in, then assist", "Rush into unstable areas", "Ignore PPE", "Move heavy debris alone"], 0,
    "Rescuer safety first, then controlled help."),
  mcq("Triage basics:",
    ["Treat first seen", "Sort by severity and survivability", "Only help children", "Wait for hospital"], 1,
    "Triage saves the most lives."),
  mcq("Building re-entry:",
    ["If it looks okay, enter", "Wait for inspection and posted status", "Kick doors", "Run inside quickly"], 1,
    "Structural checks prevent secondary injuries."),
  mcq("Communications redundancy:",
    ["Phone only", "SMS, radio, meet points, paper notes if needed", "Social media only", "None"], 1,
    "Multiple channels improve coordination."),
  mcq("Non-structural hazards include:",
    ["Loose shelves, glass, gas bottles", "Only cracks", "Only elevators", "Only carpets"], 0,
    "Secure items to reduce injuries."),
  mcq("Shelter safety after quake:",
    ["Heaters in tents w/o vents", "CO hazard awareness, ventilation, safe stoves", "Candles near fabric", "None"], 1,
    "Prevent CO poisoning and fires."),
]);

/* ------------------------- CYCLONE ---------------------- */
const CYC_BEGINNER = mk("cyclone-beginner", "Cyclone Safety — Beginner", "CYCLONE", "BEGINNER", 70, 0, [
  mcq("Watch vs Warning:",
    ["Same", "Watch: possible; Warning: happening/likely now", "Opposite", "Neither matters"], 1,
    "Warnings mean act now."),
  mcq("Best home shelter:",
    ["Room with many windows", "Interior small room/lowest level, away from glass", "Garage", "Balcony"], 1,
    "Pick interior rooms and avoid windows."),
  mcq("Kit basics include:",
    ["Snacks only", "Water, food, meds for 3+ days", "Decorations", "Board games only"], 1,
    "Sustain yourself if services fail."),
  mcq("Secure outdoor items by:",
    ["Leaving out", "Bringing in or tying down", "Planting trees", "Hanging lights"], 1,
    "Loose items can become projectiles."),
  mcq("Vehicle readiness:",
    ["Empty tank", "Keep fuel & park away from trees", "Windows down", "Roof open"], 1,
    "Fuel + safe parking matters."),
  mcq("Power outage prep:",
    ["No batteries", "Flashlights, charged power banks, fridge plan", "Only candles", "Ignore meds"], 1,
    "Plan for extended outages."),
]);

const CYC_INTERMEDIATE = mk("cyclone-intermediate", "Cyclone Safety — Intermediate", "CYCLONE", "INTERMEDIATE", 70, 0, [
  mcq("Boarding windows:",
    ["Thin cardboard", "Proper plywood, securely fixed", "Tape only", "Nothing"], 1,
    "Plywood reduces breakage/debris."),
  mcq("Safe room features:",
    ["Facing glass wall", "Interior, no windows, sturdy door", "Top floor balcony", "Garage door zone"], 1,
    "Reduce windborne debris risk."),
  mcq("Fridge strategy:",
    ["Open often", "Keep closed, use thermometer, prep ice", "Turn off early", "Fill with warm items"], 1,
    "Maintain cold chain for food safety."),
  mcq("Comms planning:",
    ["Phone only", "Radio, SMS, out-of-area contact", "Only social media", "None"], 1,
    "Multiple channels keep info flowing."),
  mcq("Flood + cyclone risk:",
    ["Ignore surge", "Check surge maps & evacuation timing", "Drive during peak", "Stay by coast"], 1,
    "Storm surge and timing matter."),
  mcq("Generator safety:",
    ["Indoors is fine", "Outdoor, away from windows; CO detector", "In bedroom", "Bathroom ok"], 1,
    "CO risk is deadly; ventilate properly."),
]);

const CYC_ADVANCED = mk("cyclone-advanced", "Cyclone Safety — Advanced", "CYCLONE", "ADVANCED", 70, 0, [
  mcq("Evacuation timing best practice:",
    ["Last minute", "Follow official orders and traffic plans early", "After winds peak", "Never"], 1,
    "Early clearance avoids gridlock."),
  mcq("Shelter networks:",
    ["Unknown", "Know local shelters & routes; pet-friendly options", "Only luxury hotels", "None"], 1,
    "Plan where you’ll go, including pets."),
  mcq("Roof failure risk indicators:",
    ["None exist", "Uplift, loud creaks, missing shingles", "Only rain", "Only cold"], 1,
    "Signs of failure require immediate sheltering."),
  mcq("Chainsaw safety post-storm:",
    ["No PPE", "Helmet, eye/ear, chaps, gloves; never cut under tension alone", "Flip-flops ok", "Solo at night"], 1,
    "Trauma risk is high—use PPE."),
  mcq("Water safety after storm:",
    ["All water safe", "Boil notice or purification, avoid floodwater", "Drink floodwater", "Tap ok always"], 1,
    "Contamination risk is high."),
  mcq("Volunteer coordination:",
    ["Freelance solo", "Register with official orgs, follow ICS basics", "Ignore briefings", "Crowd sites"], 1,
    "Coordination prevents duplication and risk."),
]);

/* ------------------------- ACCIDENT --------------------- */
const ACC_BEGINNER = mk("acc-beginner", "Accident Response — Beginner", "ACCIDENT", "BEGINNER", 70, 0, [
  mcq("First step at an accident scene:",
    ["Rush in", "Ensure scene safety and call emergency services", "Film first", "Move everyone"], 1,
    "Don’t become a victim; call help."),
  mcq("Gloves are important because:",
    ["Fashion", "Protect from blood/fluids", "Sticky", "Cold"], 1,
    "Use barrier protection."),
  mcq("Check breathing by:",
    ["Shouting only", "Look, listen, feel", "Tickle feet", "Shake hard"], 1,
    "Assess airway/breathing quickly."),
  mcq("Bleeding control priority:",
    ["Look at wounds", "Direct pressure", "Water first", "Bandage loosely"], 1,
    "Direct pressure saves lives."),
  mcq("Emergency number in many regions:",
    ["112/911", "007", "404", "8080"], 0,
    "Know your regional emergency number."),
  mcq("Recovery position used for:",
    ["Fractures", "Unconscious breathing person", "Sprain", "Cough"], 1,
    "Keeps airway clear, prevents aspiration."),
]);

const ACC_INTERMEDIATE = mk("acc-intermediate", "Accident Response — Intermediate", "ACCIDENT", "INTERMEDIATE", 70, 0, [
  mcq("Tourniquet use:",
    ["Never", "For severe limb bleeding not controlled by pressure", "For all cuts", "Just for bruises"], 1,
    "For life-threatening extremity bleeding."),
  mcq("Shock signs:",
    ["Flushed & energetic", "Pale, cool, clammy, fast pulse", "Purple", "Always fever"], 1,
    "Classic shock presentation."),
  mcq("Suspected spinal injury:",
    ["Twist neck straight", "Manual stabilization, avoid movement", "Sit them up", "Shake awake"], 1,
    "Protect the spine until help arrives."),
  mcq("Fracture first aid:",
    ["Ignore deformity", "Immobilize above/below joints, pad & support", "Straighten forcefully", "Massage"], 1,
    "Immobilize + padding reduces pain/bleeding."),
  mcq("Chemical eye splash:",
    ["Cover eye", "Irrigate with clean water for 15+ minutes", "Patch both eyes", "Wait"], 1,
    "Immediate irrigation reduces injury."),
  mcq("Patient handover to EMS:",
    ["Say nothing", "Provide mechanism of injury, vitals, treatments, time", "Only name", "Only age"], 1,
    "Concise, structured handover helps care."),
]);

const ACC_ADVANCED = mk("acc-advanced", "Accident Response — Advanced", "ACCIDENT", "ADVANCED", 70, 0, [
  mcq("MCI priority:",
    ["Treat first seen", "Triage to save the most lives", "Treat only minor injuries", "Transport everyone first"], 1,
    "Sort first, then treat."),
  mcq("Triage tags indicate:",
    ["Fashion", "Priority categories (Immediate/Delayed/Minor/Expectant)", "Food", "Transport vendor"], 1,
    "Color-coded priorities guide resources."),
  mcq("ICS briefing includes:",
    ["Nothing", "Objectives, roles, comms, safety", "Snacks only", "Names only"], 1,
    "Briefings align teams and safety."),
  mcq("CPR for unresponsive, not breathing:",
    ["Shake & wait", "Start compressions at once and call EMS/AED", "Walk away", "Give water"], 1,
    "Every second counts."),
  mcq("AED use:",
    ["Only doctors", "Anyone following prompts", "Only firefighters", "Never"], 1,
    "Modern AEDs are designed for public use."),
  mcq("Scene control:",
    ["Crowd in", "Create safe perimeter and traffic control", "Let cars through", "Lights off"], 1,
    "Prevent secondary accidents."),
]);

export const QUIZZES = [
  FLOOD_BEGINNER, FLOOD_INTERMEDIATE, FLOOD_ADVANCED,
  FIRE_BEGINNER, FIRE_INTERMEDIATE, FIRE_ADVANCED,
  EQ_BEGINNER, EQ_INTERMEDIATE, EQ_ADVANCED,
  CYC_BEGINNER, CYC_INTERMEDIATE, CYC_ADVANCED,
  ACC_BEGINNER, ACC_INTERMEDIATE, ACC_ADVANCED,
];

export const getQuizById = (id) => QUIZZES.find(q => q.id === id);
