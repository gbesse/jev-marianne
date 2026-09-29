// Objectif : démontrer la frontière de décision sans appel réseau.
import assert from "node:assert/strict";
import { compareCommitments } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const base = {
  id: "logement-1",
  actor: "Candidate A",
  topic: "logement",
  text: "Construire 100 000 logements chaque année.",
  source: { url: "https://example.test/programme", date: "2026-01-10" },
};
const later = {
  ...base,
  id: "logement-2",
  text: "Viser jusqu’à 100 000 logements si les finances le permettent.",
  source: { url: "https://example.test/speech", date: "2026-09-01" },
};
const provider = createFakeProvider(() => ({
  model: "jev-1.13.0",
  answers: {
    relation: {
      type: "choice",
      choice: "possible_reversal",
      probabilities: {
        new_commitment: 0.02,
        reformulation: 0.08,
        clarification: 0.1,
        possible_reversal: 0.76,
        unrelated: 0.04,
      },
      confidence: 0.76,
    },
  },
  usage: { input_tokens: 180, output_tokens: 0 },
}));
const resultat = await compareCommitments(base, later, provider);
assert.equal(resultat.relation, "possible_reversal");
console.log(JSON.stringify(resultat, null, 2));
