// Cas limite : un engagement inchangé ne doit jamais appeler Jev.
import assert from "node:assert/strict";
import { compareCommitments } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";

const engagement = {
  id: "logement-1",
  actor: "Candidate A",
  topic: "logement",
  text: "Construire 100 000 logements chaque année.",
  source: { url: "https://example.test/programme", date: "2026-01-10" },
};
const jev = createFakeProvider(() => {
  throw new Error("Jev ne doit pas être appelé");
});
const resultat = await compareCommitments(engagement, engagement, jev);
assert.equal(resultat.relation, "unchanged");
assert.equal(resultat.deterministic, true);
assert.equal(jev.calls, 0);
console.log(JSON.stringify(resultat, null, 2));
