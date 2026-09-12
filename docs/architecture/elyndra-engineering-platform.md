# Elyndra Engineering Platform

This fork evolves Zoo Code into a model-agnostic engineering control plane combining three product strengths:

- Codex-style delegated engineering campaigns with durable task state and evidence;
- Cursor-style tight editor interaction, fast edit/test loops, and human steering;
- Augment-style repository understanding, codebase context, and architecture-aware retrieval.

The objective is not to copy another product's UI. The objective is to combine the strongest operating concepts into one coherent engineering system.

## Existing Zoo assets we preserve

Zoo already provides the right chassis: VS Code extension-host integration, React webview UI, provider abstraction, task delegation and persistence, scheduler/lifecycle modeling, worktree support, MCP/tool execution, codebase indexing, checkpoints, CLI support, and a mature test/CI structure. The fork should extend those seams rather than create parallel replacements.

The existing lifecycle model is especially important. Parent/child delegation, interruption, completion, scheduler ownership, persistence, and provider handoff already have explicit invariants and bounded model checks. New fan-out orchestration must refine those contracts rather than bypass them.

## Product architecture

```text
Human intent
   |
Engineering Lead
   |
Campaign / dependency graph
   +---- audit / research
   +---- architecture
   +---- implementation workers
   +---- test / debug workers
   +---- review / security
   `---- qualification
          |
     receipts + evidence
          |
   editor-visible result
```

The fifteen engineering roles in `.roomodes` are a capability library. The lead selects the smallest justified team. A simple defect may use Debugger -> Test Engineer -> Reviewer. A cross-system feature may require Audit -> Architecture -> parallel frontend/backend/integration workers -> Test -> Security -> Review -> Qualification.

## Control-plane contracts

`packages/types/src/engineering-platform.ts` introduces shared contracts for campaigns, work items, role identity, receipts, capabilities, and model-routing decisions.

`src/core/engineering/workGraph.ts` validates dependency graphs before execution and identifies runnable work only when dependencies have verified outcomes.

The first model router lives in `src/core/engineering/modelRouter.ts`. It is deliberately deterministic and provider-neutral. The router filters on capability and a risk-derived quality floor before considering cost or latency. This prevents a cheap model preference from silently routing critical security or authority work to an under-qualified model.

Provider profiles remain the source of credentials and concrete model configuration. The engineering router selects among configured profiles; it does not own secrets.

## Planned runtime evolution

### 1. Campaign persistence

Add a durable campaign store keyed independently from the existing single-task history while referencing existing task IDs. Campaign state must survive extension restart and expose exact lifecycle state without inventing a second task-status authority.

### 2. Parallel worker scheduling

Build fan-out on top of the existing task lifecycle and scheduler contracts. Parallel workers should normally receive isolated worktrees/branches and explicit write scopes. Conflicting write scopes should serialize or require an integration owner.

### 3. Provider routing and escalation

Add configurable candidate pools such as DeepSeek, Qwen, Kimi, GLM, OpenAI, and local providers. Routing policy should support role capability, measured quality, context requirements, latency, cost, provider health, concurrency, and evidence-backed escalation. A model failure may trigger a stronger route, but routing must never weaken domain authority or tool permissions.

### 4. Engineering workspace UI

The webview should gain an engineering workspace rather than remain only a linear chat surface. The target UI includes:

- campaign tree / dependency graph;
- running and queued workers;
- active model/provider per worker;
- token/cost/latency telemetry;
- worktree/branch and changed-file scope;
- terminal/test receipts;
- diff and review findings;
- blocked dependencies and escalation reasons;
- exact verification state: implemented, locally tested, CI verified, merged, deployed, runtime observed.

Chat remains important, but it becomes one control surface inside the workspace rather than the sole representation of work.

### 5. Repository intelligence

Repository indexing should feed a durable architecture map: entry points, modules, symbols, contracts, tests, data stores, integrations, dependency edges, recent decisions, and known failure evidence. Retrieval should be task-scoped so agents receive the smallest useful context instead of blindly expanding prompts.

### 6. Receipts and memory

Every delegated action should leave machine-readable receipts for model choice, tool actions, tests, reviews, provider failures, and qualification. Future agents may use prior receipts as evidence, but historical model statements are not automatically facts.

## Authority model

The engineering lead coordinates; it does not gain unlimited authority. Role, repository, and project rules constrain tool access and write scope. Domain-specific repositories can add governance overlays for financial execution, customer data, deployment, or other consequential operations.

Implementation, testing, review, and qualification must remain separable responsibilities for consequential changes. A system that lets one worker write code, grade itself, and declare production readiness has automation but not trustworthy engineering control.

## Upstream strategy

Keep this fork structurally close enough to `Zoo-Code-Org/Zoo-Code` to consume upstream fixes. New product behavior should prefer additive modules and explicit seams over gratuitous rewrites. Divergence is justified where this fork needs durable campaign orchestration, richer routing, repository intelligence, or a substantially different engineering workspace.
