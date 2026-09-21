// Purpose: Describe sourced political commitments and relationship decisions.
import type { JevProvider } from "./jev.mjs";
export type Commitment = {
  id: string;
  actor: string;
  text: string;
  topic: string;
  source: { url: string; date: string };
};
export const RELATIONS: readonly string[];
export function commitment(input: any): Commitment;
export function compareCommitments(
  before: any,
  after: any,
  provider: JevProvider,
): Promise<any>;
export function runCli(
  argv: string[],
  io?: { log(value: string): void },
): Promise<void>;
