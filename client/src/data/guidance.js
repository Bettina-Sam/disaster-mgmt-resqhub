// Built-in safety guidance. Used when the AI service is unavailable (no key, quota used, offline).
// Content follows widely published public-safety advice (NDMA India, Red Cross, FEMA). Keep it short.
// Each entry: `match` is tested against the user's message (English, Hindi and Tamil keywords).

export const GUIDANCE = [
  {
    id: "flood",
    match: /flood|water level|inundat|बाढ़|जलभराव|வெள்ளம்/i,
    en: "Flood: move to higher ground now. Switch off electricity at the main if it is safe. Never walk or drive through moving water (15 cm can knock you down). Keep documents, phone, medicines and drinking water in a bag. Call 112 if you are trapped.",
    hi: "बाढ़: तुरंत ऊँची जगह पर जाएँ। सुरक्षित हो तो मेन स्विच बंद करें। बहते पानी में पैदल या गाड़ी से न जाएँ। दस्तावेज़, फ़ोन, दवाइयाँ और पीने का पानी बैग में रखें। फँस जाएँ तो 112 पर कॉल करें।",
    ta: "வெள்ளம்: உடனே உயரமான இடத்திற்குச் செல்லுங்கள். பாதுகாப்பாக இருந்தால் மெயின் சுவிட்சை அணைக்கவும். ஓடும் தண்ணீரில் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம். ஆவணங்கள், தொலைபேசி, மருந்து, குடிநீரை பையில் வைத்திருங்கள். சிக்கிக்கொண்டால் 112-ஐ அழைக்கவும்.",
  },
  {
    id: "earthquake",
    match: /earthquake|quake|tremor|shaking|भूकंप|நிலநடுக்கம்/i,
    en: "Earthquake: DROP to the ground, take COVER under a sturdy table, HOLD ON until the shaking stops. Stay away from windows. If outdoors, move away from buildings and power lines. Do not use lifts. After shaking, expect aftershocks and check for gas leaks.",
    hi: "भूकंप: झुकें, मज़बूत मेज़ के नीचे छिपें और झटके रुकने तक पकड़े रहें। खिड़कियों से दूर रहें। बाहर हों तो इमारतों और बिजली के तारों से दूर जाएँ। लिफ़्ट का उपयोग न करें। बाद के झटकों के लिए तैयार रहें और गैस रिसाव जाँचें।",
    ta: "நிலநடுக்கம்: தரையில் குனிந்து, உறுதியான மேசையின் கீழ் புகுந்து, அதிர்வு நிற்கும் வரை பிடித்துக்கொள்ளுங்கள். ஜன்னல்களிலிருந்து விலகி இருங்கள். வெளியே இருந்தால் கட்டிடங்கள், மின் கம்பிகளிலிருந்து விலகுங்கள். லிஃப்ட் வேண்டாம். பின்அதிர்வுகளை எதிர்பாருங்கள், எரிவாயு கசிவைச் சரிபாருங்கள்.",
  },
  {
    id: "cyclone",
    match: /cyclone|storm|hurricane|typhoon|चक्रवात|तूफ़ान|तूफान|புயல்/i,
    en: "Cyclone: stay indoors, away from windows. Charge phones and power banks, store water and dry food. Follow IMD and district orders and evacuate if told to. Do not go out during the calm eye of the storm; winds return from the other side.",
    hi: "चक्रवात: घर के अंदर, खिड़कियों से दूर रहें। फ़ोन और पावर बैंक चार्ज करें, पानी और सूखा खाना रखें। IMD और ज़िला प्रशासन के निर्देश मानें, कहा जाए तो सुरक्षित स्थान पर जाएँ। तूफ़ान की आँख के शांत समय में बाहर न निकलें।",
    ta: "புயல்: வீட்டுக்குள், ஜன்னல்களிலிருந்து விலகி இருங்கள். தொலைபேசி, பவர் பேங்க் சார்ஜ் செய்யுங்கள், தண்ணீர், உலர் உணவு சேமியுங்கள். IMD மற்றும் மாவட்ட நிர்வாக அறிவுறுத்தல்களைப் பின்பற்றி, சொன்னால் வெளியேறுங்கள். புயலின் கண் அமைதியாக இருக்கும்போது வெளியே செல்ல வேண்டாம்.",
  },
  {
    id: "fire",
    match: /\bfire\b|smoke|burn|blaze|आग|धुआँ|தீ\b|தீவிபத்து|புகை/i,
    en: "Fire: get out and stay out. Crawl low under smoke. Feel doors before opening; if hot, use another way. Do not use lifts. Once outside, call 101 (fire) or 112. If your clothes catch fire: stop, drop, cover your face and roll.",
    hi: "आग: बाहर निकलें और वापस न जाएँ। धुएँ के नीचे झुककर चलें। दरवाज़ा खोलने से पहले छूकर देखें, गर्म हो तो दूसरा रास्ता लें। लिफ़्ट न लें। बाहर आकर 101 या 112 पर कॉल करें। कपड़ों में आग लगे तो रुकें, ज़मीन पर लेटें, चेहरा ढकें और लोटें।",
    ta: "தீ: வெளியேறி மீண்டும் உள்ளே செல்ல வேண்டாம். புகைக்குக் கீழே தவழ்ந்து செல்லுங்கள். கதவைத் திறக்கும் முன் தொட்டுப் பாருங்கள், சூடாக இருந்தால் வேறு வழி. லிஃப்ட் வேண்டாம். வெளியே வந்ததும் 101 அல்லது 112-ஐ அழைக்கவும். ஆடையில் தீ பிடித்தால் நிற்கவும், தரையில் படுத்து முகத்தை மூடி உருளவும்.",
  },
  {
    id: "heatwave",
    match: /heat ?wave|heat stroke|sunstroke|\bhot\b|लू|गर्मी|வெப்ப/i,
    en: "Heatwave: drink water often, even if not thirsty. Stay indoors 11am-4pm, wear light cotton clothes, cover your head outside. For heat stroke (very hot dry skin, confusion, fainting): move to shade, cool the body with wet cloths, call 108 or 112.",
    hi: "लू: प्यास न हो तब भी बार-बार पानी पिएँ। सुबह 11 से शाम 4 बजे तक घर में रहें, हल्के सूती कपड़े पहनें, बाहर सिर ढकें। लू लगने (बहुत गर्म सूखी त्वचा, भ्रम, बेहोशी) पर छाया में ले जाएँ, गीले कपड़े से ठंडा करें, 108 या 112 पर कॉल करें।",
    ta: "வெப்ப அலை: தாகம் இல்லாவிட்டாலும் அடிக்கடி தண்ணீர் குடியுங்கள். காலை 11 முதல் மாலை 4 வரை வீட்டிலேயே இருங்கள், இலகுவான பருத்தி ஆடை அணியுங்கள். வெப்பத் தாக்கம் (மிகச் சூடான வறண்ட தோல், குழப்பம், மயக்கம்) ஏற்பட்டால் நிழலுக்கு அழைத்துச் சென்று ஈரத்துணியால் குளிர்வித்து 108 அல்லது 112-ஐ அழைக்கவும்.",
  },
  {
    id: "landslide",
    match: /landslide|mudslide|भूस्खलन|நிலச்சரிவு/i,
    en: "Landslide: move away from the slide path, uphill sideways rather than down the valley. Listen for rumbling or cracking. Avoid river valleys during heavy rain. After it passes, stay away; more slides can follow. Call 112.",
    hi: "भूस्खलन: ढलान के रास्ते से हटकर बगल की ऊँची जगह पर जाएँ। गड़गड़ाहट या दरार की आवाज़ सुनें। भारी बारिश में नदी घाटियों से बचें। इसके बाद भी दूर रहें, और भूस्खलन हो सकते हैं। 112 पर कॉल करें।",
    ta: "நிலச்சரிவு: சரிவுப் பாதையிலிருந்து விலகி, பக்கவாட்டில் உயரமான இடத்திற்குச் செல்லுங்கள். இரைச்சல் அல்லது விரிசல் ஒலியைக் கவனியுங்கள். கனமழையில் ஆற்றுப் பள்ளத்தாக்கைத் தவிர்க்கவும். மேலும் சரிவுகள் வரக்கூடும். 112-ஐ அழைக்கவும்.",
  },
  {
    id: "lightning",
    match: /lightning|thunder|बिजली गिर|இடி|மின்னல்/i,
    en: "Lightning: go indoors or into a hard-roofed vehicle. Do not shelter under a lone tree. If caught in the open, crouch low on the balls of your feet, head tucked, and keep away from water and metal.",
    hi: "बिजली गिरना: घर या पक्की छत वाले वाहन में जाएँ। अकेले पेड़ के नीचे न रुकें। खुले में हों तो पंजों के बल झुककर बैठें, सिर नीचे रखें, पानी और धातु से दूर रहें।",
    ta: "மின்னல்: வீட்டுக்குள் அல்லது கூரையுள்ள வாகனத்துக்குள் செல்லுங்கள். தனி மரத்தின் கீழ் நிற்க வேண்டாம். திறந்த வெளியில் இருந்தால் தலையைக் குனிந்து குத்துக்காலிட்டு அமருங்கள், நீர் மற்றும் உலோகத்திலிருந்து விலகுங்கள்.",
  },
  {
    id: "tsunami",
    match: /tsunami|सुनामी|சுனாமி/i,
    en: "Tsunami: if you feel a strong quake near the coast, or hear an official warning, move inland and uphill immediately. Do not wait to see the wave. Stay away from the coast until officials say it is safe, as later waves can be larger.",
    hi: "सुनामी: तट के पास तेज़ भूकंप महसूस हो या आधिकारिक चेतावनी मिले तो तुरंत भीतरी और ऊँचे इलाके में जाएँ। लहर देखने का इंतज़ार न करें। अधिकारी सुरक्षित बताएँ तब तक तट से दूर रहें।",
    ta: "சுனாமி: கடற்கரைக்கு அருகில் வலுவான நிலநடுக்கம் உணர்ந்தாலோ அதிகாரப்பூர்வ எச்சரிக்கை வந்தாலோ உடனே உள்நாட்டு உயரமான பகுதிக்குச் செல்லுங்கள். அலையைப் பார்க்கக் காத்திருக்க வேண்டாம். அதிகாரிகள் பாதுகாப்பு என்று சொல்லும் வரை கடலோரத்திலிருந்து விலகி இருங்கள்.",
  },
  {
    id: "firstaid",
    match: /first ?aid|bleed|wound|cpr|faint|unconscious|choking|snake|प्राथमिक|खून|முதலுதவி|இரத்தம்/i,
    en: "First aid basics: Call 108 or 112 first. Heavy bleeding: press firmly with a clean cloth and do not remove it. Not breathing and unresponsive: push hard and fast in the centre of the chest, about 100 to 120 per minute, until help arrives. Snake bite: keep the person still and calm, do not cut or suck the wound, get to a hospital.",
    hi: "प्राथमिक उपचार: पहले 108 या 112 पर कॉल करें। तेज़ खून बहे तो साफ़ कपड़े से कसकर दबाएँ, कपड़ा न हटाएँ। साँस न चल रही हो और होश न हो तो छाती के बीच में तेज़ी से दबाएँ, लगभग 100-120 प्रति मिनट, मदद आने तक। साँप काटे तो व्यक्ति को शांत और स्थिर रखें, घाव को काटें या चूसें नहीं, अस्पताल पहुँचें।",
    ta: "முதலுதவி: முதலில் 108 அல்லது 112-ஐ அழைக்கவும். அதிக இரத்தப்போக்கு: சுத்தமான துணியால் அழுத்திப் பிடியுங்கள், துணியை எடுக்க வேண்டாம். சுவாசம் இல்லாமல் சுயநினைவு இல்லையென்றால் மார்பின் நடுவில் நிமிடத்திற்கு சுமார் 100-120 முறை வேகமாக அழுத்துங்கள். பாம்புக்கடி: அமைதியாக அசையாமல் இருக்கச் செய்து, காயத்தை வெட்டவோ உறிஞ்சவோ வேண்டாம், மருத்துவமனைக்குச் செல்லுங்கள்.",
  },
  {
    id: "kit",
    match: /kit|prepare|preparedness|go bag|supplies|तैयारी|किट|தயார்|கிட்/i,
    en: "Emergency kit: 3 days of drinking water (about 3 litres per person per day), dry food, torch and spare batteries, power bank, first-aid box and personal medicines, copies of ID papers in a waterproof pouch, cash, whistle, and a battery or hand-crank radio. Agree a meeting place with your family.",
    hi: "आपातकालीन किट: 3 दिन का पीने का पानी (प्रति व्यक्ति रोज़ लगभग 3 लीटर), सूखा खाना, टॉर्च और बैटरी, पावर बैंक, प्राथमिक उपचार बॉक्स और निजी दवाइयाँ, पहचान पत्रों की प्रतियाँ वॉटरप्रूफ़ पाउच में, नकद, सीटी और रेडियो। परिवार के साथ मिलने की जगह तय करें।",
    ta: "அவசரகாலத் தொகுப்பு: 3 நாளுக்கு குடிநீர் (ஒருவருக்கு நாளொன்றுக்கு சுமார் 3 லிட்டர்), உலர் உணவு, டார்ச் மற்றும் பேட்டரி, பவர் பேங்க், முதலுதவிப் பெட்டி மற்றும் தனிப்பட்ட மருந்துகள், அடையாள ஆவண நகல்கள் நீர்புகாப் பையில், பணம், விசில், ரேடியோ. குடும்பத்துடன் சந்திக்கும் இடத்தை முடிவு செய்யுங்கள்.",
  },
  {
    id: "numbers",
    match: /number|helpline|call|ambulance|police|emergency|नंबर|हेल्पलाइन|எண்|அவசர/i,
    en: "India emergency numbers: 112 (all emergencies), 100 police, 101 fire, 102 or 108 ambulance, 1078 disaster management (NDMA), 181 women helpline, 1098 Childline. The Emergency numbers card on the dashboard lists other countries.",
    hi: "भारत के आपातकालीन नंबर: 112 (सभी आपात स्थितियाँ), 100 पुलिस, 101 फ़ायर, 102 या 108 एम्बुलेंस, 1078 आपदा प्रबंधन (NDMA), 181 महिला हेल्पलाइन, 1098 चाइल्डलाइन। अन्य देशों के नंबर डैशबोर्ड के कार्ड में हैं।",
    ta: "இந்திய அவசர எண்கள்: 112 (அனைத்து அவசரங்கள்), 100 காவல், 101 தீயணைப்பு, 102 அல்லது 108 ஆம்புலன்ஸ், 1078 பேரிடர் மேலாண்மை (NDMA), 181 பெண்கள் உதவி, 1098 சைல்ட்லைன். பிற நாடுகளின் எண்கள் டாஷ்போர்டு அட்டையில் உள்ளன.",
  },
  {
    id: "shelter",
    match: /shelter|hospital|nearby|nearest|evacuat|relief|आश्रय|अस्पताल|पास|தங்குமிடம்|மருத்துவமனை/i,
    en: "To find the nearest hospitals, police, fire stations and shelters, open Help near you on the dashboard and tap Find near me. It uses OpenStreetMap, so coverage varies; if you are in danger, call 112 instead of searching.",
    hi: "नज़दीकी अस्पताल, पुलिस, फ़ायर स्टेशन और आश्रय के लिए डैशबोर्ड पर 'आपके पास सहायता' खोलें और 'मेरे पास खोजें' दबाएँ। यह OpenStreetMap का उपयोग करता है, इसलिए कवरेज अलग-अलग हो सकता है। ख़तरे में हों तो खोजने के बजाय 112 पर कॉल करें।",
    ta: "அருகிலுள்ள மருத்துவமனை, காவல், தீயணைப்பு நிலையம், தங்குமிடம் காண டாஷ்போர்டில் 'உங்கள் அருகில் உதவி' திறந்து 'என் அருகில் தேடு' அழுத்தவும். இது OpenStreetMap பயன்படுத்துவதால் பகுதிக்கு ஏற்ப மாறுபடும். ஆபத்தில் இருந்தால் தேடாமல் 112-ஐ அழைக்கவும்.",
  },
];

const DEFAULT = {
  en: "I can help with floods, earthquakes, cyclones, fires, heatwaves, landslides, first aid, emergency kits and emergency numbers. Try asking, for example, what to do in a flood. In any life-threatening situation, call 112 first.",
  hi: "मैं बाढ़, भूकंप, चक्रवात, आग, लू, भूस्खलन, प्राथमिक उपचार, आपातकालीन किट और आपातकालीन नंबरों में मदद कर सकता हूँ। जैसे पूछें: बाढ़ में क्या करें? जान को ख़तरा हो तो पहले 112 पर कॉल करें।",
  ta: "வெள்ளம், நிலநடுக்கம், புயல், தீ, வெப்ப அலை, நிலச்சரிவு, முதலுதவி, அவசரகாலத் தொகுப்பு, அவசர எண்கள் குறித்து உதவ முடியும். எ.கா. வெள்ளத்தில் என்ன செய்வது? உயிருக்கு ஆபத்து என்றால் முதலில் 112-ஐ அழைக்கவும்.",
};

export function localAnswer(message, lang = "en") {
  const l = ["en", "hi", "ta"].includes(lang) ? lang : "en";
  const hit = GUIDANCE.find((g) => g.match.test(message));
  return hit ? hit[l] : DEFAULT[l];
}
