// Merges the per-area dictionaries into one lookup: English string -> { hi, ta }.
// Each part is an array of [English, Hindi, Tamil].
import academy from "./dict.academy.js";
import lessons1 from "./dict.lessons1.js";
import lessons2 from "./dict.lessons2.js";
import quizzes1 from "./dict.quizzes1.js";
import quizzes2 from "./dict.quizzes2.js";
import quizzes3 from "./dict.quizzes3.js";
import quizzes4 from "./dict.quizzes4.js";
import pages from "./dict.pages.js";
import games from "./dict.games.js";

const norm = (s) => s.replace(/\s+/g, " ").trim();

export const DICT = {};
for (const part of [academy, lessons1, lessons2, quizzes1, quizzes2, quizzes3, quizzes4, pages, games]) {
  for (const [en, hi, ta] of part) DICT[norm(en)] = { hi, ta };
}
