// Text for the background scenes on the lesson pages. Every string is { en, hi, ta }.
export const SCENE_UI = {
  how: { en: "How it works", hi: "यह कैसे काम करता है", ta: "இது எப்படி வேலை செய்கிறது" },
  hide: { en: "Hide", hi: "छिपाएँ", ta: "மறை" },
  show: { en: "Show game", hi: "खेल दिखाएँ", ta: "விளையாட்டைக் காட்டு" },
  listen: { en: "Read aloud", hi: "सुनें", ta: "கேள்" },
  mission: { en: "Mission", hi: "मिशन", ta: "பணி" },
  done: { en: "Mission complete! Keep going or take the quiz.", hi: "मिशन पूरा! खेलते रहें या क्विज़ लें।", ta: "பணி முடிந்தது! தொடர்ந்து விளையாடு அல்லது வினாடி வினா எடு." },
  background: { en: "This game runs behind the lesson while you read.", hi: "पाठ पढ़ते समय यह खेल पीछे चलता रहता है।", ta: "நீ படிக்கும்போது இந்த விளையாட்டு பின்னணியில் ஓடும்." },
};

export const SCENES = {
  flood: {
    emoji: "🌊", target: 5,
    title: { en: "Lifebuoy Rescue", hi: "लाइफबॉय बचाव", ta: "மிதவை மீட்பு" },
    goal: { en: "Save 5 people from drowning", hi: "5 लोगों को डूबने से बचाएँ", ta: "5 பேரை மூழ்குவதிலிருந்து காப்பாற்று" },
    steps: [
      { en: "The water level rises and falls. People standing in the water start to drown.", hi: "पानी का स्तर घटता-बढ़ता है। पानी में खड़े लोग डूबने लगते हैं।", ta: "நீர்மட்டம் ஏறி இறங்கும். நீரில் நிற்பவர்கள் மூழ்கத் தொடங்குவார்கள்." },
      { en: "Drag the 🛟 lifebuoy from the bottom-left onto a person in the water.", hi: "नीचे बाएँ से 🛟 लाइफबॉय खींचकर पानी में खड़े व्यक्ति पर छोड़ें।", ta: "கீழ்-இடதுபுறத்திலிருந்து 🛟 மிதவையை இழுத்து நீரில் இருக்கும் நபர் மீது விடு." },
      { en: "Never jump in yourself. Throw something that floats and call 112.", hi: "खुद कभी न कूदें। तैरने वाली चीज़ फेंकें और 112 पर कॉल करें।", ta: "நீ குதிக்காதே. மிதக்கும் பொருளை வீசி 112-ஐ அழை." },
    ],
    save: { en: "Saved", hi: "बचाए", ta: "காப்பாற்றியவர்கள்" },
    lose: { en: "Lost", hi: "खोए", ta: "இழந்தவர்கள்" },
    tips: {
      default: { en: "Wait until someone is in the water, then drag the 🛟 onto them.", hi: "जब कोई पानी में हो तब 🛟 को उन पर खींचें।", ta: "யாராவது நீரில் இருக்கும்போது 🛟-ஐ அவர் மீது இழு." },
    },
  },
  fire: {
    emoji: "🔥", target: 5,
    title: { en: "Fire Fighter", hi: "आग बुझाओ", ta: "தீ அணைப்பு" },
    goal: { en: "Put out 5 fires", hi: "5 आग बुझाएँ", ta: "5 தீகளை அணை" },
    steps: [
      { en: "Flames chase the people and burn them if they catch up.", hi: "आग लोगों का पीछा करती है और पकड़ने पर उन्हें जला देती है।", ta: "தீ மக்களைத் துரத்தும், பிடித்தால் எரித்துவிடும்." },
      { en: "Drag the 🧯 extinguisher from the bottom-left and drop it on a flame.", hi: "नीचे बाएँ से 🧯 अग्निशामक खींचकर लौ पर छोड़ें।", ta: "கீழ்-இடதுபுறத்திலிருந்து 🧯 தீயணைப்பானை இழுத்து தீ மீது விடு." },
      { en: "Real fires: only fight small ones with a clear exit behind you. Otherwise get out and call 101.", hi: "असली आग: केवल छोटी आग से लड़ें और पीछे निकास खुला रखें। वरना बाहर निकलें और 101 पर कॉल करें।", ta: "நிஜத் தீ: சிறியவற்றை மட்டும், பின்னால் வெளியேறும் வழி இருந்தால் அணை. இல்லையெனில் வெளியேறி 101-ஐ அழை." },
    ],
    save: { en: "Fires out", hi: "बुझाई", ta: "அணைத்தவை" },
    lose: { en: "Caught", hi: "पकड़े गए", ta: "சிக்கியவர்கள்" },
    tips: { default: { en: "Drop the 🧯 right on top of a 🔥.", hi: "🧯 को सीधे 🔥 के ऊपर छोड़ें।", ta: "🧯-ஐ நேரடியாக 🔥 மீது விடு." } },
  },
  quake: {
    emoji: "🌍", target: 5,
    title: { en: "Drop, Cover, Hold On", hi: "झुकें, छिपें, पकड़ें", ta: "குனி, மறை, பிடி" },
    goal: { en: "Keep 5 people safe in earthquakes", hi: "भूकंप में 5 लोगों को सुरक्षित रखें", ta: "நிலநடுக்கங்களில் 5 பேரைப் பாதுகாப்பாக வை" },
    steps: [
      { en: "Every few seconds the ground shakes and rocks fall.", hi: "कुछ सेकंड में ज़मीन हिलती है और पत्थर गिरते हैं।", ta: "சில வினாடிகளுக்கு ஒருமுறை நிலம் அதிரும், கற்கள் விழும்." },
      { en: "Tap a person: they Drop, Cover and Hold On under the nearest table.", hi: "किसी व्यक्ति को दबाएँ: वह पास की मेज़ के नीचे झुकता, छिपता और पकड़ता है।", ta: "ஒருவரைத் தொடு: அவர் அருகிலுள்ள மேசையின் கீழ் குனிந்து, மறைந்து, பிடித்துக்கொள்வார்." },
      { en: "People under a table when the shaking stops are safe. People in the open get hit.", hi: "झटके रुकने पर जो मेज़ के नीचे हों वे सुरक्षित हैं। खुले में खड़े लोगों को चोट लगती है।", ta: "அதிர்வு நிற்கும்போது மேசையின் கீழ் இருப்பவர்கள் பாதுகாப்பு. திறந்தவெளியில் இருப்பவர்கள் அடிபடுவார்கள்." },
    ],
    save: { en: "Kept safe", hi: "सुरक्षित रखे", ta: "பாதுகாத்தவர்கள்" },
    lose: { en: "Hurt", hi: "घायल", ta: "காயமடைந்தவர்கள்" },
    alert: { en: "🌍 EARTHQUAKE! Tap the people now: Drop, Cover, Hold On!", hi: "🌍 भूकंप! अभी लोगों को दबाएँ: झुकें, छिपें, पकड़ें!", ta: "🌍 நிலநடுக்கம்! இப்போதே மக்களைத் தொடு: குனி, மறை, பிடி!" },
    tips: { default: { en: "Good practice! Do it again as soon as the shaking starts.", hi: "अच्छा अभ्यास! झटके शुरू होते ही फिर करें।", ta: "நல்ல பயிற்சி! அதிர்வு தொடங்கியதும் மீண்டும் செய்." } },
  },
  cyclone: {
    emoji: "🌀", target: 5,
    title: { en: "Reach the Shelter", hi: "आश्रय तक पहुँचें", ta: "தங்குமிடம் சேர்" },
    goal: { en: "Move 5 people to the shelter", hi: "5 लोगों को आश्रय तक पहुँचाएँ", ta: "5 பேரைத் தங்குமிடத்துக்குக் கொண்டு செல்" },
    steps: [
      { en: "A 🌪 cyclone drifts toward the nearest person and can sweep them away.", hi: "🌪 चक्रवात सबसे पास के व्यक्ति की ओर बढ़ता है और उन्हें उड़ा ले जा सकता है।", ta: "🌪 புயல் அருகிலுள்ள நபரை நோக்கி நகரும், அவரை அடித்துச் செல்லலாம்." },
      { en: "Drag people onto the 🏠 shelter at the bottom-left.", hi: "लोगों को नीचे बाएँ के 🏠 आश्रय पर खींचें।", ta: "மக்களை கீழ்-இடதுபுற 🏠 தங்குமிடத்துக்கு இழு." },
      { en: "In real life, go to a strong inner room early and follow official warnings.", hi: "असल में जल्दी मज़बूत भीतरी कमरे में जाएँ और आधिकारिक चेतावनियाँ मानें।", ta: "நிஜத்தில் சீக்கிரம் உறுதியான உள் அறைக்குச் சென்று அதிகாரப்பூர்வ எச்சரிக்கைகளைப் பின்பற்று." },
    ],
    save: { en: "Sheltered", hi: "आश्रय में", ta: "தங்குமிடத்தில்" },
    lose: { en: "Swept away", hi: "बह गए", ta: "அடித்துச் சென்றவர்கள்" },
    tips: { default: { en: "Drag a person all the way onto the 🏠.", hi: "व्यक्ति को पूरी तरह 🏠 पर खींचें।", ta: "நபரை 🏠 மீது முழுவதுமாக இழு." } },
  },
  accident: {
    emoji: "🚑", target: 3,
    title: { en: "Road Accident Helper", hi: "सड़क दुर्घटना सहायक", ta: "சாலை விபத்து உதவியாளர்" },
    goal: { en: "Help at 3 accidents", hi: "3 दुर्घटनाओं में मदद करें", ta: "3 விபத்துகளில் உதவு" },
    steps: [
      { en: "A crash 💥 appears on the road. A timer bar shows how long you have.", hi: "सड़क पर टक्कर 💥 दिखती है। टाइमर बार बताता है कि कितना समय है।", ta: "சாலையில் மோதல் 💥 தோன்றும். டைமர் பட்டை எவ்வளவு நேரம் உள்ளது என்று காட்டும்." },
      { en: "In order: 1) drag the 🔺 triangle up the road before the crash, 2) tap 📞 112, 3) tap 🩹 first aid.", hi: "क्रम से: 1) 🔺 त्रिकोण को टक्कर से पहले सड़क पर रखें, 2) 📞 112 दबाएँ, 3) 🩹 प्राथमिक उपचार दबाएँ।", ta: "வரிசையாக: 1) 🔺 முக்கோணத்தை மோதலுக்கு முன் சாலையில் வை, 2) 📞 112-ஐ அழுத்து, 3) 🩹 முதலுதவியை அழுத்து." },
      { en: "Safety first: never rush in without making the scene safe.", hi: "सुरक्षा पहले: घटनास्थल सुरक्षित किए बिना कभी न दौड़ें।", ta: "பாதுகாப்பு முதலில்: இடத்தைப் பாதுகாப்பாக்காமல் ஒருபோதும் ஓடிப் போகாதே." },
    ],
    save: { en: "Helped", hi: "मदद की", ta: "உதவியவை" },
    lose: { en: "Too late", hi: "देर हो गई", ta: "தாமதம்" },
    alert: { en: "🚗💥 Crash! In order: 1 🔺 triangle, 2 📞 call, 3 🩹 first aid.", hi: "🚗💥 टक्कर! क्रम से: 1 🔺 त्रिकोण, 2 📞 कॉल, 3 🩹 प्राथमिक उपचार।", ta: "🚗💥 மோதல்! வரிசையாக: 1 🔺 முக்கோணம், 2 📞 அழைப்பு, 3 🩹 முதலுதவி." },
    tips: {
      default: { en: "Do the steps in order: triangle, call, first aid.", hi: "चरण क्रम से करें: त्रिकोण, कॉल, प्राथमिक उपचार।", ta: "படிகளை வரிசையாகச் செய்: முக்கோணம், அழைப்பு, முதலுதவி." },
      safe: { en: "Make the scene safe first: drag the 🔺 up the road, before the crash.", hi: "पहले घटनास्थल सुरक्षित करें: 🔺 को टक्कर से पहले सड़क पर रखें।", ta: "முதலில் இடத்தைப் பாதுகாப்பாக்கு: 🔺-ஐ மோதலுக்கு முன் சாலையில் வை." },
      call: { en: "Call 112 before you give first aid.", hi: "प्राथमिक उपचार से पहले 112 पर कॉल करें।", ta: "முதலுதவிக்கு முன் 112-ஐ அழை." },
      place: { en: "Drop the 🔺 on the road, a few steps before the crash.", hi: "🔺 को टक्कर से कुछ कदम पहले सड़क पर छोड़ें।", ta: "🔺-ஐ மோதலுக்குச் சில அடி முன் சாலையில் விடு." },
    },
  },
};

// lesson ids look like "flood-beginner" or "eq-beginner"
export function hazardForLesson(id = "") {
  const raw = id.split("-")[0].toLowerCase();
  if (raw === "eq" || raw === "earthquake" || raw === "quake") return "quake";
  if (raw === "acc") return "accident";
  return SCENES[raw] ? raw : null;
}
