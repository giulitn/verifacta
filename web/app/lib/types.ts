// Mirror of langgraph_agent/agent.py:AgentEvent. Keep in lockstep with the
// Python contract — every type/data pair must match what api.py emits.

export type Citation = {
  database: string;
  indicator: string;
};

export type ClaimCardData = {
  answer: string;
  indicators: Citation[];
  timestamp: string;
  sha256: string;
};

export type AgentEvent =
  | {
      type: "tool_call_start";
      data: { name: string; args: Record<string, unknown>; id: string };
    }
  | { type: "tool_call_end"; data: { id: string } }
  | { type: "final_answer"; data: { text: string } }
  | { type: "claim_card"; data: ClaimCardData }
  | { type: "error"; data: { message: string } }
  | { type: "done"; data: Record<string, never> };
