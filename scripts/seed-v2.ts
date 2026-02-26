// =============================================================
// Sheng Dictionary — Seed File v2 (Additional Words)
// =============================================================
// These are NEW words not in the original seed.ts file.
// Run: pnpm seed:v2
// Add to package.json scripts: "seed:v2": "tsx scripts/seed-v2.ts"
// =============================================================

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const definitionSchema = new mongoose.Schema({
  meaning: String,
  example: String,
  addedBy: { type: String, default: "seed" },
});

const wordSchema = new mongoose.Schema(
  {
    word: { type: String, required: true, unique: true, lowercase: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    definitions: [definitionSchema],
    partOfSpeech: {
      type: String,
      enum: ["noun", "verb", "adjective", "expression", "adverb"],
      default: "noun",
    },
    origin: String,
    relatedWords: [String],
    region: { type: String, default: "Nationwide" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    viewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: true },
    tags: [String],
    submittedBy: { type: String, default: "seed" },
  },
  { timestamps: true }
);

const Word = mongoose.models.Word || mongoose.model("Word", wordSchema);

const words = [
  // ── PEOPLE & RELATIONSHIPS ────────────────────────────────
  {
    word: "mshothre",
    slug: "mshothre",
    definitions: [{ meaning: "A girl / young woman", example: "Ile mshothre anakaa Westlands." }],
    partOfSpeech: "noun",
    tags: ["people", "girls"],
    region: "Nairobi",
    relatedWords: ["dem", "manzi", "denge"],
  },
  {
    word: "denge",
    slug: "denge",
    definitions: [{ meaning: "A girl / young woman", example: "Ile denge ni mrembo, naomba unishow." }],
    partOfSpeech: "noun",
    tags: ["people", "girls"],
    region: "Nationwide",
    relatedWords: ["dem", "manzi", "mshothre"],
  },
  {
    word: "monyiko",
    slug: "monyiko",
    definitions: [{ meaning: "A girl", example: "Monyiko yule anajua kucheza ngoma." }],
    partOfSpeech: "noun",
    tags: ["people", "girls"],
    region: "Nairobi",
  },
  {
    word: "mokoro",
    slug: "mokoro",
    definitions: [{ meaning: "A mother / an older woman", example: "Mokoro wangu amenipigia simu." }],
    partOfSpeech: "noun",
    origin: "Corruption of Swahili 'mama' and Kikuyu influences",
    tags: ["people", "family"],
    region: "Nairobi",
    relatedWords: ["mathe", "mziza", "mukoro"],
  },
  {
    word: "mukoro",
    slug: "mukoro",
    definitions: [{ meaning: "Mother / mum", example: "Mukoro wangu anapika nyama leo." }],
    partOfSpeech: "noun",
    tags: ["people", "family"],
    region: "Nairobi",
    relatedWords: ["mathe", "mokoro"],
  },
  {
    word: "shosh",
    slug: "shosh",
    definitions: [{ meaning: "Grandmother", example: "Nilienda ku-visit shosh wangu upcountry." }],
    partOfSpeech: "noun",
    origin: "Corruption of Swahili 'bibi' influenced by English 'gran'",
    tags: ["people", "family"],
    region: "Nationwide",
  },
  {
    word: "charji",
    slug: "charji",
    definitions: [{ meaning: "Brother / close male friend", example: "Charji wangu alinisort pesa." }],
    partOfSpeech: "noun",
    tags: ["people", "family", "friends"],
    region: "Nairobi",
  },
  {
    word: "mbafu-chweda",
    slug: "mbafu-chweda",
    definitions: [{ meaning: "True friends / real ones / ride or die crew", example: "Hawa ndio mbafu chweda, watakusort hali yoyote." }],
    partOfSpeech: "expression",
    tags: ["people", "friends", "loyalty"],
    region: "Nairobi",
  },

  // ── GREETINGS & EXPRESSIONS ───────────────────────────────
  {
    word: "diglo",
    slug: "diglo",
    definitions: [{ meaning: "Do you understand? / Do you get me? / You feel me?", example: "Hii kitu ni serious, diglo?" }],
    partOfSpeech: "expression",
    tags: ["greetings", "expression", "genz"],
    region: "Nairobi",
  },
  {
    word: "shavaa",
    slug: "shavaa",
    definitions: [{ meaning: "Cool / nice / awesome", example: "Outfit yako ni shavaa kabisa leo." }],
    partOfSpeech: "adjective",
    tags: ["compliment", "everyday"],
    region: "Nairobi",
  },
  {
    word: "bwachwe",
    slug: "bwachwe",
    definitions: [{ meaning: "Okay / alright / sawa", example: "Tutaonana kesho? Bwachwe, niko." }],
    partOfSpeech: "expression",
    tags: ["expression", "agreement"],
    region: "Nairobi",
  },
  {
    word: "gwan",
    slug: "gwan",
    definitions: [{ meaning: "Hard / tough / difficult", example: "Maisha ni gwan bana, lakini tutashinda." }],
    partOfSpeech: "adjective",
    origin: "Possibly from English 'gone wrong'",
    tags: ["expression", "everyday"],
    region: "Nationwide",
  },
  {
    word: "saloka",
    slug: "saloka",
    definitions: [{ meaning: "To talk / to speak / to chat", example: "Tusaloke kidogo kuhusu hii project." }],
    partOfSpeech: "verb",
    tags: ["communication", "actions"],
    region: "Nairobi",
  },
  {
    word: "barojaa",
    slug: "barojaa",
    definitions: [{ meaning: "To talk / to have a conversation", example: "Kuja tubarojane, mambo mengi ya kuzungumza." }],
    partOfSpeech: "verb",
    tags: ["communication", "actions"],
    region: "Nairobi",
  },
  {
    word: "maisha-ya-kibabi",
    slug: "maisha-ya-kibabi",
    definitions: [{ meaning: "A rich or good life / living lavishly", example: "Baada ya kuomoka tutaishi maisha ya kibabi." }],
    partOfSpeech: "expression",
    tags: ["lifestyle", "money", "success"],
    region: "Nationwide",
  },
  {
    word: "nimekufia",
    slug: "nimekufia",
    definitions: [{ meaning: "I am deeply in love with you / I'm crazy about you", example: "Nimekufia huyo dem, sijui nifanye nini." }],
    partOfSpeech: "expression",
    origin: "From Swahili 'kufa' (to die) — dying for someone",
    tags: ["relationships", "love", "expression"],
    region: "Nationwide",
  },
  {
    word: "teke",
    slug: "teke",
    definitions: [{ meaning: "Fast / quickly / hurry up", example: "Fanya teke, tunachelewa!" }],
    partOfSpeech: "adverb",
    tags: ["everyday", "speed"],
    region: "Nairobi",
  },
  {
    word: "usoro",
    slug: "usoro",
    definitions: [{ meaning: "Snoopiness / nosiness / being in other people's business", example: "Acha usoro, hii si shughuli yako." }],
    partOfSpeech: "noun",
    tags: ["personality", "negative"],
    region: "Nairobi",
  },

  // ── MONEY ─────────────────────────────────────────────────
  {
    word: "monyo",
    slug: "monyo",
    definitions: [{ meaning: "Money", example: "Una monyo? Nikusort chakula." }],
    partOfSpeech: "noun",
    tags: ["money"],
    region: "Nairobi",
    relatedWords: ["ganji", "chapaa", "maziwa"],
  },
  {
    word: "maziwa",
    slug: "maziwa",
    definitions: [{ meaning: "Money / cash", example: "Maziwa yangu yameisha, mwezi mzima bado." }],
    partOfSpeech: "noun",
    origin: "Swahili for 'milk' — repurposed to mean money",
    tags: ["money"],
    region: "Nationwide",
    relatedWords: ["ganji", "chapaa", "monyo"],
  },
  {
    word: "goro",
    slug: "goro",
    definitions: [{ meaning: "Gold / something valuable / money", example: "Hii deal ina goro, sign haraka." }],
    partOfSpeech: "noun",
    tags: ["money", "value"],
    region: "Nairobi",
  },
  {
    word: "mkwanja",
    slug: "mkwanja",
    definitions: [{ meaning: "Money / cash", example: "Mkwanja ndo inaendesha dunia hii." }],
    partOfSpeech: "noun",
    tags: ["money"],
    region: "Nationwide",
    relatedWords: ["ganji", "chapaa"],
  },

  // ── PLACES ────────────────────────────────────────────────
  {
    word: "marima",
    slug: "marima",
    definitions: [{ meaning: "Home / where you live", example: "Naenda marima, kesho tutaonana." }],
    partOfSpeech: "noun",
    tags: ["places", "home"],
    region: "Nairobi",
    relatedWords: ["mta", "rotejo", "balaluu"],
  },
  {
    word: "muoroto",
    slug: "muoroto",
    definitions: [{ meaning: "A house made of iron sheets or wood / informal settlement housing", example: "Alianza na muoroto, sasa ana apartment." }],
    partOfSpeech: "noun",
    tags: ["places", "housing", "hood"],
    region: "Nairobi",
  },
  {
    word: "ndondo",
    slug: "ndondo",
    definitions: [{ meaning: "Jail / prison / lock-up", example: "Alienda ndondo kwa miaka miwili." }],
    partOfSpeech: "noun",
    tags: ["places", "crime", "police"],
    region: "Nationwide",
  },
  {
    word: "kwanga",
    slug: "kwanga",
    definitions: [{ meaning: "Heaven / paradise / a great place", example: "Hii party ni kama kwanga, moto sana." }],
    partOfSpeech: "noun",
    origin: "Short for 'Kwa Ngai' — Kikuyu for 'at God's place'",
    tags: ["places", "expression", "religion"],
    region: "Nairobi",
  },

  // ── TRANSPORT ─────────────────────────────────────────────
  {
    word: "pira",
    slug: "pira",
    definitions: [{ meaning: "A car / vehicle", example: "Pira yake mpya ni nzuri sana." }],
    partOfSpeech: "noun",
    tags: ["transport", "cars"],
    region: "Nairobi",
    relatedWords: ["mrenga"],
  },
  {
    word: "rodhi",
    slug: "rodhi",
    definitions: [{ meaning: "Trousers / pants", example: "Rodhi yake ni ya designer, imebeba." }],
    partOfSpeech: "noun",
    tags: ["fashion", "clothing"],
    region: "Nairobi",
  },

  // ── POLICE & CRIME ────────────────────────────────────────
  {
    word: "mavedi",
    slug: "mavedi",
    definitions: [{ meaning: "Police officers", example: "Mavedi wameweka roadblock hapo mbele." }],
    partOfSpeech: "noun",
    tags: ["police", "authority"],
    region: "Nairobi",
    relatedWords: ["karao", "mbaru", "mambanga", "sinya"],
  },
  {
    word: "mambanga",
    slug: "mambanga",
    definitions: [{ meaning: "Police officers", example: "Mambanga wamekuja, wacha vitu." }],
    partOfSpeech: "noun",
    tags: ["police", "authority"],
    region: "Nairobi",
    relatedWords: ["karao", "mavedi"],
  },
  {
    word: "sinya",
    slug: "sinya",
    definitions: [{ meaning: "Police / police officer", example: "Sinya amekusimamisha, piga heshima." }],
    partOfSpeech: "noun",
    tags: ["police", "authority"],
    region: "Nairobi",
    relatedWords: ["karao", "mavedi", "mambanga"],
  },
  {
    word: "regre",
    slug: "regre",
    definitions: [{ meaning: "A thief / someone who steals", example: "Regre yule amechukua bag ya msee." }],
    partOfSpeech: "noun",
    tags: ["crime", "people"],
    region: "Nairobi",
    relatedWords: ["pinji"],
  },
  {
    word: "ringis",
    slug: "ringis",
    definitions: [{ meaning: "Handcuffs", example: "Wakamweka ringis akaenda ndondo." }],
    partOfSpeech: "noun",
    tags: ["police", "crime"],
    region: "Nairobi",
  },
  {
    word: "marwa",
    slug: "marwa",
    definitions: [{ meaning: "Arrested / to be arrested", example: "Alimawa usiku, alikuwa na kitu kibaya." }],
    partOfSpeech: "verb",
    tags: ["police", "crime"],
    region: "Nairobi",
  },
  {
    word: "peremba",
    slug: "peremba",
    definitions: [{ meaning: "To search and steal from someone / to pickpocket", example: "Aliperembiwa kwa stage, akabaki bila simu." }],
    partOfSpeech: "verb",
    tags: ["crime", "theft"],
    region: "Nairobi",
  },

  // ── TECHNOLOGY & ITEMS ────────────────────────────────────
  {
    word: "mokia",
    slug: "mokia",
    definitions: [{ meaning: "A mobile phone", example: "Mokia yake ni ya latest, iPhone 15." }],
    partOfSpeech: "noun",
    origin: "From Nokia — the iconic phone brand",
    tags: ["technology", "phones"],
    region: "Nairobi",
    relatedWords: ["tonje", "thiang"],
  },
  {
    word: "toje",
    slug: "toje",
    definitions: [{ meaning: "A laptop / computer", example: "Nifanye kazi kwa toje yangu usiku huu." }],
    partOfSpeech: "noun",
    tags: ["technology", "computers"],
    region: "Nairobi",
  },
  {
    word: "ngoto",
    slug: "ngoto",
    definitions: [{ meaning: "A ring / piece of jewellery", example: "Ngoto yake ni ya gold, ni ghali." }],
    partOfSpeech: "noun",
    tags: ["fashion", "jewellery"],
    region: "Nairobi",
  },
  {
    word: "mbota",
    slug: "mbota",
    definitions: [{ meaning: "A watch / wristwatch", example: "Mbota yake ni ya Rolex, ni ya kweli." }],
    partOfSpeech: "noun",
    tags: ["fashion", "accessories"],
    region: "Nairobi",
  },

  // ── FOOD ──────────────────────────────────────────────────
  {
    word: "jiva",
    slug: "jiva",
    definitions: [{ meaning: "French fries / chips", example: "Nipe jiva na ketchup, nina njaa." }],
    partOfSpeech: "noun",
    tags: ["food", "everyday"],
    region: "Nairobi",
  },
  {
    word: "waru",
    slug: "waru",
    definitions: [{ meaning: "Potatoes / Irish potatoes", example: "Leo tutapika waru na nyama." }],
    partOfSpeech: "noun",
    origin: "From Kikuyu 'ndūrū' for potato",
    tags: ["food"],
    region: "Nairobi",
  },
  {
    word: "njiva",
    slug: "njiva",
    definitions: [{ meaning: "Chips / french fries / vibanzi", example: "Kuja tushiriki njiva hizi." }],
    partOfSpeech: "noun",
    tags: ["food", "everyday"],
    region: "Nairobi",
    relatedWords: ["jiva"],
  },

  // ── LIFESTYLE & ACTIONS ───────────────────────────────────
  {
    word: "chachisha",
    slug: "chachisha",
    definitions: [{ meaning: "To have fun / to do wild things / to go off", example: "Usiku wa leo tutachachisha, ni birthday yangu." }],
    partOfSpeech: "verb",
    tags: ["lifestyle", "party", "fun"],
    region: "Nairobi",
  },
  {
    word: "rongesa",
    slug: "rongesa",
    definitions: [{ meaning: "To move / to shift / to go somewhere", example: "Rongesa twende, tunachelewa." }],
    partOfSpeech: "verb",
    tags: ["actions", "movement"],
    region: "Nairobi",
  },
  {
    word: "gurumisha",
    slug: "gurumisha",
    definitions: [{ meaning: "To start / to kick off / to get things going", example: "Gurumisha gari, tuende." }],
    partOfSpeech: "verb",
    tags: ["actions", "start"],
    region: "Nairobi",
  },
  {
    word: "kujaa-gas",
    slug: "kujaa-gas",
    definitions: [{ meaning: "To get angry / to fill up with rage", example: "Nikijua alinicheat, nilijaa gas kabisa." }],
    partOfSpeech: "expression",
    tags: ["emotions", "anger"],
    region: "Nationwide",
  },
  {
    word: "limpueza",
    slug: "limpueza",
    definitions: [{ meaning: "Intoxication / being drunk or high", example: "Alikuwa kwa limpueza yake, hawezi walk sawa." }],
    partOfSpeech: "noun",
    tags: ["substances", "alcohol"],
    region: "Nairobi",
  },
  {
    word: "dunga",
    slug: "dunga",
    definitions: [{ meaning: "To wear / to put on clothes", example: "Dunga nguo smart, tunakwenda event." }],
    partOfSpeech: "verb",
    tags: ["fashion", "actions"],
    region: "Nairobi",
  },
  {
    word: "kugura",
    slug: "kugura",
    definitions: [{ meaning: "To leave / to vacate / to get out of somewhere", example: "Tugure hapa, hali inakuwa mbaya." }],
    partOfSpeech: "verb",
    tags: ["actions", "movement"],
    region: "Nairobi",
  },
  {
    word: "sereche",
    slug: "sereche",
    definitions: [{ meaning: "A report / to report someone / to tell on someone", example: "Alifanya sereche kwa teacher, mtiaji." }],
    partOfSpeech: "noun",
    tags: ["communication", "school", "negative"],
    region: "Nairobi",
  },
  {
    word: "denki",
    slug: "denki",
    definitions: [{ meaning: "To go for a long call / to go to the toilet", example: "Niende denki kwanza, nitarudi." }],
    partOfSpeech: "verb",
    tags: ["everyday", "expression"],
    region: "Nairobi",
  },

  // ── MUSIC & CULTURE ───────────────────────────────────────
  {
    word: "doba",
    slug: "doba",
    definitions: [{ meaning: "A song / a track / a banger", example: "Ile doba mpya ya Wakadinali ni moto sana." }],
    partOfSpeech: "noun",
    tags: ["music", "entertainment"],
    region: "Nationwide",
  },
  {
    word: "avi",
    slug: "avi",
    definitions: [{ meaning: "A profile picture / avatar / social media profile", example: "Badilisha avi yako, ile ya zamani ni mbaya." }],
    partOfSpeech: "noun",
    origin: "From English 'avatar'",
    tags: ["social-media", "technology", "genz"],
    region: "Nationwide",
  },
  {
    word: "mapangale",
    slug: "mapangale",
    definitions: [{ meaning: "A popular dance style", example: "Watu wote wanafanya mapangale kwa show." }],
    partOfSpeech: "noun",
    origin: "Created by MC Zendiambo also known as Stanama",
    tags: ["dance", "music", "culture"],
    region: "Nationwide",
  },

  // ── SUBSTANCES ────────────────────────────────────────────
  {
    word: "magwethe",
    slug: "magwethe",
    definitions: [{ meaning: "Bhang / marijuana / cannabis", example: "Harufu ya magwethe inatoka kwa geto." }],
    partOfSpeech: "noun",
    tags: ["substances", "weed"],
    region: "Nairobi",
    relatedWords: ["kolo", "kindukulu", "ngusu"],
  },
  {
    word: "ngwedhe",
    slug: "ngwedhe",
    definitions: [{ meaning: "Miraa / khat", example: "Wanamaliza ngwedhe usiku kucha." }],
    partOfSpeech: "noun",
    tags: ["substances", "khat"],
    region: "Nairobi",
    relatedWords: ["jaba", "gwethe"],
  },
  {
    word: "gwethe",
    slug: "gwethe",
    definitions: [{ meaning: "Pure khat / miraa", example: "Gwethe ya leo ilikuwa fresh, kutoka Meru." }],
    partOfSpeech: "noun",
    origin: "Associated with Gwethe TV by Buruklyn Boyz associates",
    tags: ["substances", "khat"],
    region: "Nationwide",
    relatedWords: ["jaba", "ngwedhe"],
  },
  {
    word: "fegi",
    slug: "fegi",
    definitions: [{ meaning: "A cigarette", example: "Ukivuta fegi sana utajiletea noma." }],
    partOfSpeech: "noun",
    origin: "From English 'fag' (cigarette)",
    tags: ["substances", "smoking"],
    region: "Nationwide",
  },
  {
    word: "tiree",
    slug: "tiree",
    definitions: [{ meaning: "Marijuana / weed", example: "Harufu ya tiree inatoka kwa basement." }],
    partOfSpeech: "noun",
    tags: ["substances", "weed"],
    region: "Nairobi",
    relatedWords: ["kolo", "kindukulu"],
  },
  {
    word: "vela",
    slug: "vela",
    definitions: [{ meaning: "Marijuana / weed", example: "Walipatikana na vela, wakaenda ndondo." }],
    partOfSpeech: "noun",
    tags: ["substances", "weed"],
    region: "Nairobi",
    relatedWords: ["kolo", "tiree"],
  },

  // ── BODY ──────────────────────────────────────────────────
  {
    word: "nyash",
    slug: "nyash",
    definitions: [{ meaning: "Buttocks / backside", example: "Nyash yake inabeba." }],
    partOfSpeech: "noun",
    tags: ["body"],
    region: "Nationwide",
    relatedWords: ["aga", "thutha"],
  },
  {
    word: "aga",
    slug: "aga",
    definitions: [{ meaning: "Buttocks / butt", example: "Alikaa chini na aga yake peke yake." }],
    partOfSpeech: "noun",
    tags: ["body"],
    region: "Nairobi",
    relatedWords: ["nyash"],
  },

  // ── SCHOOL & EDUCATION ────────────────────────────────────
  {
    word: "daro",
    slug: "daro",
    definitions: [{ meaning: "A classroom / class", example: "Sepa daro kabla mwalimu hakuja." }],
    partOfSpeech: "noun",
    tags: ["education", "school"],
    region: "Nairobi",
  },
  {
    word: "odijo",
    slug: "odijo",
    definitions: [{ meaning: "A teacher / lecturer", example: "Odijo wetu wa maths ni mkali sana." }],
    partOfSpeech: "noun",
    tags: ["education", "school", "people"],
    region: "Nairobi",
    relatedWords: ["mode"],
  },

  // ── MISC / SHENG TEZZO & SHEMBETENG ──────────────────────
  {
    word: "ndanashwa",
    slug: "ndanashwa",
    definitions: [{ meaning: "Murdered / killed / taken out", example: "Msee alidanashwa usiku, ni mbaya." }],
    partOfSpeech: "verb",
    tags: ["crime", "violence", "street"],
    region: "Nairobi",
  },
  {
    word: "genja",
    slug: "genja",
    definitions: [{ meaning: "Death / to die", example: "Alienda genja baada ya accident." }],
    partOfSpeech: "noun",
    tags: ["expression", "death"],
    region: "Nairobi",
    relatedWords: ["ganda", "nyuria"],
  },
  {
    word: "njora",
    slug: "njora",
    definitions: [{ meaning: "A knife / sword / blade", example: "Alikuwa na njora mfukoni, ni hatari." }],
    partOfSpeech: "noun",
    tags: ["weapons", "street", "danger"],
    region: "Nairobi",
    relatedWords: ["kidi"],
  },
  {
    word: "adida",
    slug: "adida",
    definitions: [{ meaning: "A football / soccer ball", example: "Chukua adida tuende kortko." }],
    partOfSpeech: "noun",
    origin: "From the Adidas brand, famous for their football",
    tags: ["sports", "football"],
    region: "Nairobi",
  },
  {
    word: "akorino",
    slug: "akorino",
    definitions: [{ meaning: "A traffic police officer", example: "Akorino amekusimamisha, toa leseni." }],
    partOfSpeech: "noun",
    origin: "Named after the Akorino religious sect known for their white turbans — traffic police also wear white",
    tags: ["police", "traffic"],
    region: "Nairobi",
    relatedWords: ["karao", "mavedi"],
  },
  {
    word: "akamero",
    slug: "akamero",
    definitions: [{ meaning: "A garbage truck", example: "Akamero imekuja kuchukua taka." }],
    partOfSpeech: "noun",
    tags: ["everyday", "nairobi"],
    region: "Nairobi",
  },
  {
    word: "magondi",
    slug: "magondi",
    definitions: [{ meaning: "Robbers / thugs / dangerous criminals", example: "Usipite hapo usiku, magondi wako." }],
    partOfSpeech: "noun",
    tags: ["crime", "danger", "street"],
    region: "Nairobi",
    relatedWords: ["regre", "pinji"],
  },
  {
    word: "njeve",
    slug: "njeve",
    definitions: [{ meaning: "Fear / to be scared", example: "Aliingiwa njeve alipowaona magondi." }],
    partOfSpeech: "noun",
    tags: ["emotions", "fear"],
    region: "Nairobi",
    relatedWords: ["gwaya"],
  },
  {
    word: "skari",
    slug: "skari",
    definitions: [{ meaning: "Proud / boastful / showing off", example: "Tangu apata pesa amekuwa skari sana." }],
    partOfSpeech: "adjective",
    tags: ["personality", "negative"],
    region: "Nairobi",
  },
  {
    word: "mbioni",
    slug: "mbioni",
    definitions: [{ meaning: "In a hurry / rushing / on the move", example: "Niko mbioni, tutaongea baadaye." }],
    partOfSpeech: "expression",
    tags: ["everyday", "speed"],
    region: "Nationwide",
    relatedWords: ["teke"],
  },
  {
    word: "fala",
    slug: "fala",
    definitions: [{ meaning: "A fool / an idiot / someone stupid", example: "Huu msee ni fala, hakujua basic." }],
    partOfSpeech: "noun",
    tags: ["insult", "people"],
    region: "Nationwide",
  },
  {
    word: "mavi",
    slug: "mavi",
    definitions: [{ meaning: "Nonsense / rubbish / bad talk", example: "Acha kubonga mavi, usiongee tena." }],
    partOfSpeech: "noun",
    origin: "Swahili for faeces, repurposed to mean nonsense",
    tags: ["insult", "expression"],
    region: "Nationwide",
  },
  {
    word: "noma",
    slug: "noma",
    definitions: [
      { meaning: "Trouble / a problem / a serious situation", example: "Ukifanya hivyo utajileteea noma." },
    ],
    partOfSpeech: "noun",
    tags: ["everyday", "warning", "trouble"],
    region: "Nationwide",
  },
  {
    word: "morgen",
    slug: "morgen",
    definitions: [{ meaning: "Morning", example: "Morgen tukutane kwa zabe." }],
    partOfSpeech: "noun",
    origin: "Borrowed from German 'morgen' meaning morning",
    tags: ["time", "everyday"],
    region: "Nairobi",
  },
  {
    word: "idha",
    slug: "idha",
    definitions: [{ meaning: "Time / the time", example: "Idha ni ngapi saa hii?" }],
    partOfSpeech: "noun",
    tags: ["time", "everyday"],
    region: "Nairobi",
  },
  {
    word: "msoto",
    slug: "msoto",
    definitions: [{ meaning: "Poverty / being broke / lack of money", example: "Msoto unanikaribia mwezi huu." }],
    partOfSpeech: "noun",
    tags: ["money", "poverty"],
    region: "Nationwide",
    relatedWords: ["ganji"],
  },
  {
    word: "ngware",
    slug: "ngware",
    definitions: [{ meaning: "Early / early morning", example: "Aliamka ngware sana kukimbia." }],
    partOfSpeech: "adverb",
    tags: ["time", "everyday"],
    region: "Nairobi",
  },
  {
    word: "chuom",
    slug: "chuom",
    definitions: [{ meaning: "A path / a road / a route", example: "Gura hiyo chuom, ni hatari usiku." }],
    partOfSpeech: "noun",
    tags: ["places", "transport"],
    region: "Nairobi",
  },
  {
    word: "radar",
    slug: "radar",
    definitions: [{ meaning: "News / information / what's happening", example: "Radar ni fom, mambo makubwa yametokea." }],
    partOfSpeech: "noun",
    tags: ["information", "news"],
    region: "Nairobi",
    relatedWords: ["riba"],
  },
];

// ── Runner ─────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌  MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅  Connected!\n");

  console.log("🌱  Seeding additional words...");
  let added = 0;
  let skipped = 0;

  for (const word of words) {
    try {
      const result = await Word.findOneAndUpdate(
        { slug: word.slug },
        { $setOnInsert: word },
        { upsert: true, returnDocument: "before" }
      );
      if (result === null) {
        added++;
        console.log(`   ✔  ${word.word}`);
      } else {
        skipped++;
        console.log(`   ⏭  Skipped (exists): ${word.word}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.warn(`   ⚠  Error on "${word.word}": ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉  Done! ${added} new words added, ${skipped} already existed.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("💥  Seed failed:", err);
  process.exit(1);
});