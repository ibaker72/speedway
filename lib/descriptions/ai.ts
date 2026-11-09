import Anthropic from "@anthropic-ai/sdk";
import type { DescriptionFacts } from "@/lib/descriptions/facts";
import { TEMPLATE_VERSION } from "@/lib/descriptions/template";
import { validateGeneratedDescription } from "@/lib/descriptions/validate";

/**
 * OPTIONAL AI rewrite of template descriptions. Off unless
 * DESCRIPTION_AI_ENABLED=true and ANTHROPIC_API_KEY are set.
 *
 * Cost and safety controls:
 *  - Only the backfill script imports this module. Page rendering, API
 *    routes and the nightly sync never make a paid request (enforced by a
 *    test that scans app/ and components/ for imports of this file).
 *  - Results are cached in inventory.generated_description with the facts
 *    hash; a vehicle is only rewritten again when its facts change.
 *  - Each run is capped (DESCRIPTION_AI_MAX_PER_RUN, default 25) and stops
 *    entirely on a rate-limit or auth error.
 *  - Output must pass validateGeneratedDescription (no new numbers, no
 *    condition/history/warranty/financing claims) or the template is kept.
 *
 * The model receives only verified facts plus the template draft.
 */

export const DEFAULT_AI_MODEL = "claude-opus-5-5";

export interface AiUsage {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  rejected: number;
}

export interface DescriptionEnhancer {
  readonly generator: string;
  readonly usage: AiUsage;
  /** Rewritten text, or null to keep the template (disabled, failed, or rejected). */
  enhance(facts: DescriptionFacts, template: string): Promise<string | null>;
}

const SYSTEM_PROMPT = [
  "You edit used-vehicle listing descriptions for a car dealership.",
  "Rewrite the draft so it reads naturally and varies its sentence structure, using only the facts provided.",
  "Rules:",
  "- Do not add any fact, feature, number, or claim that is not in the facts or the draft.",
  "- Never mention accident or title history, service or ownership history, the number of owners, condition, inspections, reliability, warranties, certifications, financing approval, or prices.",
  "- No hype or superlatives. Write plainly, like a knowledgeable salesperson describing the car to a neighbor.",
  "- Name the full year, make, and model once; afterwards refer to it naturally.",
  "- Plain text only: 2 or 3 short paragraphs separated by a blank line, 90 to 170 words, no headings, lists, emoji, links, or phone numbers.",
  "- Keep the closing invitation to contact the dealership.",
  "Return only the rewritten description.",
].join("\n");

function compactFacts(facts: DescriptionFacts): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(facts).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
  );
}

export function aiEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.DESCRIPTION_AI_ENABLED === "true" && Boolean(env.ANTHROPIC_API_KEY);
}

export function aiMaxPerRun(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env.DESCRIPTION_AI_MAX_PER_RUN ?? 25);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 25;
}

export function createAnthropicEnhancer(options: { model?: string; maxRequests: number; client?: Anthropic }): DescriptionEnhancer {
  const model = options.model || DEFAULT_AI_MODEL;
  const client = options.client ?? new Anthropic();
  const usage: AiUsage = { requests: 0, inputTokens: 0, outputTokens: 0, rejected: 0 };
  let stopped = false;

  return {
    generator: `ai:${model}:${TEMPLATE_VERSION}`,
    usage,
    async enhance(facts, template) {
      if (stopped || usage.requests >= options.maxRequests) return null;
      usage.requests++;
      try {
        const response = await client.beta.messages.create({
          model,
          max_tokens: 2000,
          // A decline is retried on Anthropic's recommended fallback model.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          // Short, constrained rewriting: low effort keeps cost and latency down.
          output_config: { effort: "low" },
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Facts (JSON):\n${JSON.stringify(compactFacts(facts), null, 2)}\n\nDraft:\n${template}`,
            },
          ],
        });
        usage.inputTokens += response.usage.input_tokens;
        usage.outputTokens += response.usage.output_tokens;
        if (response.stop_reason !== "end_turn") {
          usage.rejected++;
          return null;
        }
        const text = response.content
          .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
          .map((block) => block.text)
          .join("")
          .trim();
        const check = validateGeneratedDescription(text, facts, template);
        if (!check.ok) {
          usage.rejected++;
          console.warn(`[descriptions:ai] rejected rewrite for ${facts.year} ${facts.make} ${facts.model}: ${check.problems.join("; ")}`);
          return null;
        }
        return text.replace(/\n{3,}/g, "\n\n");
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
          stopped = true;
          console.error(`[descriptions:ai] stopping AI enhancement for this run: ${err.status} ${err.message}`);
        } else if (err instanceof Anthropic.APIError) {
          console.error(`[descriptions:ai] request failed: ${err.status} ${err.message}`);
        } else {
          console.error(`[descriptions:ai] request failed: ${err instanceof Error ? err.message : String(err)}`);
        }
        return null;
      }
    },
  };
}
