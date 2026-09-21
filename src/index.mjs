// Purpose: Version sourced political commitments and classify relationships between two statements.
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const RELATIONS = [
  "new_commitment",
  "reformulation",
  "clarification",
  "possible_reversal",
  "unrelated",
];

export function commitment(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date)
    throw new TypeError(
      "A commitment needs id, text, source.url and source.date",
    );
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf()))
    throw new TypeError("source.date must be an ISO date");
  return {
    id: String(input.id),
    actor: String(input.actor || ""),
    text: String(input.text).trim(),
    topic: String(input.topic || "unclassified"),
    source: { url: String(input.source.url), date: date.toISOString() },
  };
}

export async function compareCommitments(beforeInput, afterInput, provider) {
  const before = commitment(beforeInput);
  const after = commitment(afterInput);
  if (before.id === after.id && before.text === after.text)
    return {
      relation: "unchanged",
      probability: 1,
      review: false,
      deterministic: true,
    };
  const response = await provider.decide({
    state: { before, after },
    questions: {
      relation: {
        type: "choice",
        instructions:
          "Classify how the later political statement relates to the earlier sourced commitment. Treat softened, strengthened, delayed, or contradicted commitments as possible_reversal.",
        criteria: Object.fromEntries(
          RELATIONS.map((x) => [x, x.replaceAll("_", " ")]),
        ),
      },
    },
  });
  const answer = response.answers.relation;
  return {
    relation: answer.choice,
    probability: answer.probabilities[answer.choice],
    confidence: answer.confidence,
    review: answer.confidence < 0.8,
    deterministic: false,
    usage: response.usage,
  };
}

export async function runCli(argv, io = console) {
  if (argv.length !== 2)
    throw new Error("Usage: jev-marianne <before.json> <after.json>");
  const [before, after] = await Promise.all(
    argv.map(async (file) => JSON.parse(await readFile(file, "utf8"))),
  );
  io.log(
    JSON.stringify(
      {
        before,
        after,
        next: "Pass these records to compareCommitments with a configured Jev provider.",
      },
      null,
      2,
    ),
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href)
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
