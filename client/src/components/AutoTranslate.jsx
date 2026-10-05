import { useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translateString } from "../i18n/translate";

const ATTRS = ["placeholder", "title", "aria-label"];
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"]);
// Module scope on purpose: switching language must still know the original English of every node.
const textOrig = new WeakMap(); // text node -> { src, out }
const attrOrig = new WeakMap(); // element -> { attr: { src, out } }

/**
 * Translates English text that components render directly (lesson and quiz content, game
 * labels, and so on) using the dictionary in i18n/dict.js. It remembers the original English
 * so switching back restores it, and it never touches anything inside [data-notranslate].
 */
export default function AutoTranslate() {
  const { language } = useLanguage();

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return undefined;

    const skip = (el) => !el || SKIP.has(el.tagName) || el.closest?.("[data-notranslate]");

    const doText = (node) => {
      const parent = node.parentElement;
      if (skip(parent)) return;
      const rec = textOrig.get(node);
      const src = rec && node.data === rec.out ? rec.src : node.data; // React wrote a new value: treat as new source
      const out = translateString(src, language);
      if (out !== node.data) node.data = out;
      textOrig.set(node, { src, out });
    };

    const doAttrs = (el) => {
      if (skip(el)) return;
      let rec = attrOrig.get(el);
      if (!rec) { rec = {}; attrOrig.set(el, rec); }
      for (const a of ATTRS) {
        const cur = el.getAttribute?.(a);
        if (cur == null) continue;
        const r = rec[a];
        const src = r && cur === r.out ? r.src : cur;
        const out = translateString(src, language);
        if (out !== cur) el.setAttribute(a, out);
        rec[a] = { src, out };
      }
    };

    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) { doText(node); return; }
      if (node.nodeType !== Node.ELEMENT_NODE || skip(node)) return;
      doAttrs(node);
      for (let c = node.firstChild; c; c = c.nextSibling) walk(c);
    };

    walk(root);
    let queued = false;
    const pending = new Set();
    const flush = () => {
      queued = false;
      obs.disconnect();
      pending.forEach((n) => { if (n.isConnected) walk(n); });
      pending.clear();
      obs.observe(root, opts);
    };
    const opts = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS };
    const obs = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "childList") m.addedNodes.forEach((n) => pending.add(n));
        else if (m.type === "characterData") pending.add(m.target);
        else if (m.type === "attributes") pending.add(m.target);
      }
      if (!queued) { queued = true; requestAnimationFrame(flush); }
    });
    obs.observe(root, opts);
    return () => obs.disconnect();
  }, [language]);

  return null;
}
