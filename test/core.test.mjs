// Purpose: Verify political commitment validation and relationship classification.
import test from "node:test";
import assert from "node:assert/strict";
import { commitment, compareCommitments } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
test("requires a source", () =>
  assert.throws(() => commitment({ id: "x", text: "y" }), /source/));
test("returns unchanged without a provider call", async () => {
  const source = {
    id: "same",
    text: "Keep the measure.",
    source: { url: "https://x.test", date: "2026-01-01" },
  };
  const provider = createFakeProvider(() => {
    throw new Error("must not run");
  });
  assert.equal(
    (await compareCommitments(source, source, provider)).relation,
    "unchanged",
  );
  assert.equal(provider.calls, 0);
});
test("classifies a changed promise", async () => {
  const p = createFakeProvider(() => ({
    model: "jev-1.13.0",
    answers: {
      relation: {
        type: "choice",
        choice: "clarification",
        probabilities: {
          new_commitment: 0,
          reformulation: 0,
          clarification: 0.9,
          possible_reversal: 0.1,
          unrelated: 0,
        },
        confidence: 0.9,
      },
    },
    usage: { input_tokens: 10, output_tokens: 0 },
  }));
  const s = {
    id: "1",
    text: "Do it",
    source: { url: "https://x.test", date: "2026-01-01" },
  };
  assert.equal(
    (await compareCommitments(s, { ...s, id: "2", text: "Do it by 2030" }, p))
      .relation,
    "clarification",
  );
});
