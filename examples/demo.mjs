// Purpose: Demonstrate promise comparison without a network call.
import { compareCommitments } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const base = {
  id: "housing-1",
  actor: "Candidate A",
  topic: "housing",
  text: "Build 100,000 homes each year.",
  source: { url: "https://example.test/programme", date: "2026-01-10" },
};
const later = {
  ...base,
  id: "housing-2",
  text: "Aim for up to 100,000 homes when finances permit.",
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
console.log(await compareCommitments(base, later, provider));
