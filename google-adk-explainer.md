---
title: "Google ADK Explained"
slug: "google-adk"
subtitle: "Google's open-source, code-first framework for building, evaluating, and deploying production AI agents."
hero_meta:
  - "Apache 2.0 · Open Source"
  - "Python · TypeScript · Go · Java"
  - "Optimised for Gemini · Model-agnostic"
sources_validated: true
last_reviewed: "2026-05-10"
primary_sources:
  - "https://github.com/google/adk-python"
  - "https://github.com/google/adk-docs"
  - "https://google.github.io/adk-docs/"
  - "https://github.com/a2aproject/A2A"
  - "https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/"
tags: ["agent-frameworks", "google-cloud", "vertex-ai", "a2a", "mcp", "multi-agent"]
---

# Google ADK Explained

Google's open-source, code-first framework for building, evaluating, and deploying production AI agents — across Python, TypeScript, Go, and Java.

---

## 01 · What Is Google ADK

Agent Development Kit (ADK) is an open-source framework, released by Google in April 2025, for building and deploying AI agents and multi-agent systems. It's licensed under Apache 2.0 and lives across four sibling repos: [`google/adk-python`](https://github.com/google/adk-python), [`google/adk-js`](https://github.com/google/adk-js), [`google/adk-go`](https://github.com/google/adk-go), and [`google/adk-java`](https://github.com/google/adk-java), with shared docs at [`google/adk-docs`](https://github.com/google/adk-docs).

The core idea: agent development should feel like software development. Code-first definitions, version control, unit tests, evaluation harnesses, and CI/CD — not prompt soup glued together with retries.

ADK ships three things in one framework:

1. **An agent runtime** — `LlmAgent` for reasoning, plus deterministic workflow agents (`SequentialAgent`, `ParallelAgent`, `LoopAgent`) for predictable orchestration.
2. **A tool ecosystem** — pre-built tools, custom Python/TS functions, OpenAPI specs, MCP servers, and adapter classes (`LangchainTool`, `CrewaiTool`) that consume tools from other frameworks.
3. **A deploy story** — local dev UI, `adk api_server`, then one of three production paths on Google Cloud (Cloud Run, GKE, or Vertex AI Agent Engine), or any container runtime you prefer.

ADK is optimised for Gemini but explicitly model-agnostic via a `BaseLlm` interface and LiteLLM integration, so OpenAI, Anthropic, Mistral, and self-hosted models all work.

```
[ User ] → [ Root Agent ] → [ Sub-agents ] → [ Tools / MCP / A2A remotes ]
              │                  │
              └─ Session ────────┴─ Memory Bank
```

---

## 02 · Why It Matters

ADK arrived in a crowded field — LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, Anthropic Agent SDK — but it brought three things most others didn't have on day one: native A2A protocol support, Gemini Live API streaming for voice and video, and a one-command path to managed deployment on Vertex AI.

| Stat | Figure | Source |
|------|--------|--------|
| GitHub stars (`adk-python`) | 17,500+ | [github.com/google/adk-python](https://github.com/google/adk-python) |
| Languages supported | 4 | Python, TypeScript, Go, Java |
| Release cadence | ~bi-weekly | `adk-python` README |
| Latest stable Python | v1.23.0+ (Jan 2026) | [releases](https://github.com/google/adk-python/releases) |
| ADK 2.0 status | Beta (Python) | [adk-docs/2.0](https://google.github.io/adk-docs/2.0/) |
| License | Apache 2.0 | `LICENSE` |
| Protocol surface | A2A, MCP, OpenAPI | A2A donated to Linux Foundation |

The framework is moving fast. Between launch in April 2025 and ADK 2.0 Beta in early 2026, Google shipped 25+ minor releases, added three new language runtimes, and re-platformed the broader Vertex AI Agent Builder around it (rebranded as Gemini Enterprise Agent Platform at Cloud Next 2026, per Google Cloud's own [pricing docs](https://cloud.google.com/vertex-ai/pricing)).

---

## 03 · How It Works

Four primitives carry most of the framework: **Agents**, **Tools**, **Sessions**, and **Runners**.

### The minimal agent

A working agent is roughly ten lines of Python. This is from the official [`adk-python` README](https://github.com/google/adk-python):

```python
from google.adk.agents import Agent
from google.adk.tools import google_search

root_agent = Agent(
    name="search_assistant",
    model="gemini-2.5-flash",
    instruction="You are a helpful assistant. Use search when needed.",
    description="An assistant that can search the web.",
    tools=[google_search],
)
```

Run it with `adk web` (dev UI), `adk run` (CLI), or `adk api_server` (REST API).

### Multi-agent hierarchies

ADK's native pattern is a tree: a root agent delegates to sub-agents, which can have their own sub-agents. The framework handles routing based on agent descriptions and the LLM's reasoning.

```python
from google.adk.agents import Agent

greeter = Agent(name="greeter", model="gemini-2.5-flash",
                instruction="Handle greetings only.")

weather = Agent(name="weather", model="gemini-2.5-flash",
                instruction="Answer weather questions.",
                tools=[get_weather])

root = Agent(
    name="coordinator",
    model="gemini-2.5-flash",
    instruction="Route to the right specialist.",
    sub_agents=[greeter, weather],
)
```

### Workflow agents (deterministic)

When you don't want the LLM deciding the order, use deterministic workflow agents:

- `SequentialAgent` — runs sub-agents in order
- `ParallelAgent` — runs sub-agents concurrently
- `LoopAgent` — repeats until a condition is met

### ADK 2.0 graph workflows (Beta)

ADK 2.0 (currently Beta in Python only) adds explicit graph-based workflows where every node is an Agent, Tool, function, or human-input step, connected by edges that can route conditionally. The `Workflow` class replaces deeply nested prompt instructions with explicit DAGs:

```python
from google.adk import Agent, Workflow, Event

root_agent = Workflow(
    name="routing_workflow",
    edges=[
        ("START", classify_message, router),
        (router, {
            "BUG": handle_bug,
            "SUPPORT": handle_support,
            "LOGISTICS": handle_logistics,
        }),
    ],
)
```

ADK 2.0 also introduces `RequestInput` for human-in-the-loop nodes that don't require an LLM call — useful for approvals, validation, and form-style data capture inside a workflow.

> **Note:** ADK 2.0 is pre-GA at the time of writing. Install with `pip install --pre google-adk`. Don't ship it to production until it goes GA. The official [2.0 docs](https://google.github.io/adk-docs/2.0/) flag breaking changes from 1.x.

### Sessions and memory

Two layers, deliberately separated:

- **Sessions** hold the state of a single conversation. Backends include `InMemorySessionService`, `VertexAiSessionService`, and a community-contributed `FirestoreSessionService`.
- **Memory** holds long-term facts across sessions. `InMemoryMemoryService` for tests, `VertexAiMemoryBankService` for production.

### Tool interop

ADK consumes tools from outside its own ecosystem:

- **MCP tools** — connect any [Model Context Protocol](https://modelcontextprotocol.io) server via `MCPToolset`
- **LangChain tools** — wrap with `LangchainTool`
- **CrewAI tools** — wrap with `CrewaiTool`
- **OpenAPI specs** — auto-generate tools from a spec
- **Custom Python functions** — pass them in directly; ADK introspects the signature

### A2A: agent-to-agent

For talking to agents in other processes, languages, or frameworks, ADK uses the [Agent2Agent (A2A) Protocol](https://github.com/a2aproject/A2A) — originally released by Google and now an open-source project under the Linux Foundation.

Two helpers do most of the work:

```python
# Expose your ADK agent as an A2A server
from google.adk.a2a.utils.agent_to_a2a import to_a2a
app = to_a2a(root_agent)  # serves an Agent Card at /.well-known/agent-card.json

# Consume a remote A2A agent (any framework) as if it were local
from google.adk.agents import RemoteA2aAgent
remote = RemoteA2aAgent(name="pricing", agent_card="https://pricing.example.com")
```

A2A advertises agent skills via an Agent Card (JSON at `/.well-known/agent-card.json`), uses JSON-RPC over HTTP for messages, and supports streaming and push notifications. ADK agents can call LangGraph or CrewAI agents — and vice versa — through the same protocol.

---

## 04 · The Ecosystem

ADK sits inside Google's broader agent stack and against a field of competing frameworks.

### Where ADK fits in Google's stack

| Layer | Component | What it does |
|-------|-----------|--------------|
| Framework | **ADK** | Open-source code-first SDK (Apache 2.0) |
| Visual builder | Agent Studio | Low-code canvas, part of Vertex AI Agent Builder |
| Templates | Agent Garden | Prebuilt agent samples and one-click deploys |
| Models | Model Garden / Gemini | 200+ foundation models including Gemini, Claude, Gemma, Llama |
| Runtime | **Vertex AI Agent Engine** | Managed runtime — sessions, memory, scaling |
| Memory | Memory Bank | Long-term, cross-session memory store |
| Protocol | **A2A** | Cross-framework agent communication (Linux Foundation) |
| Tool protocol | **MCP** | Model Context Protocol for tools and data |

### When to use what (vs. peers)

| Framework | Best at | Watch out for |
|-----------|---------|---------------|
| **Google ADK** | GCP-native deployments, multi-agent hierarchies, voice/multimodal via Gemini Live, A2A interop | Native experience leans Google Cloud — value drops off-platform |
| **LangGraph** | Explicit graph control, LangSmith observability, the largest tool ecosystem via LangChain | Higher boilerplate; steeper learning curve |
| **CrewAI** | Role-based "team" metaphors, fastest to a first prototype | Limited checkpointing; less suited to dynamic flows |
| **OpenAI Agents SDK** | Tight integration with OpenAI models and built-in tracing | OpenAI-only model support |
| **Anthropic Agent SDK** | Claude-first agents, MCP-native, extended thinking | Claude-only |
| **AutoGen / AG2** | Conversational multi-agent group chats, research workflows | Production tooling still maturing |

The frameworks aren't mutually exclusive. A2A means you can run an ADK orchestrator that calls a LangGraph specialist that calls a CrewAI sub-team — each in its own container, each in its own language. That's the bet ADK is making: be the orchestration hub, not the only framework you use.

---

## 05 · Use Cases

Six patterns where ADK earns its keep, drawn from Google's official samples and community deployments:

- **Customer support concierge** — a root agent that routes to billing, technical, or returns sub-agents, with A2A escalation to human-handoff agents
- **BigQuery analyst** — agent + BigQuery MCP toolset for natural-language data exploration, deployed on Cloud Run with Agent Engine sessions
- **Voice agents** — bidirectional audio/video via Gemini Live API, the one place ADK has a meaningful edge over LangGraph and CrewAI
- **Document processing pipelines** — `SequentialAgent` chains for extract → classify → enrich → store, with `LoopAgent` retries on validation failures
- **Cross-framework orchestration** — ADK as the A2A hub calling LangGraph and CrewAI specialists for use cases where a single team owns the orchestration but other teams own the sub-agents
- **Internal developer agents** — code review, PR triage, doc generation; Google itself uses ADK-powered agents to manage the ADK GitHub repo (per their public Q3 2025 roadmap)

---

## 06 · Evolution

A short, factual timeline:

- **April 9, 2025** — ADK Python launches as open source under Apache 2.0 ([Google Developers Blog](https://developers.googleblog.com/en/agent-development-kit-easy-to-build-multi-agent-applications/))
- **Mid-2025** — A2A Protocol announced; ADK ships native A2A integration
- **August 2025** — ADK Python v1.12 introduces YAML-based Agent Config (no-code agent authoring) and Bigtable toolset
- **October 2025** — First ADK community meeting; Cloud Run + GKE + Agent Engine deployment paths formalised
- **January 2026** — ADK Python v1.23 lands, OpenTelemetry GenAI semantic conventions adopted for tracing
- **March 2026** — ADK Java 1.0 ships, ADK 2.0 Alpha announced with graph-based workflows
- **April 2026** — Vertex AI Agent Builder rebranded to Gemini Enterprise Agent Platform at Cloud Next 2026
- **May 2026** — ADK 2.0 in Beta for Python, ADK TypeScript 1.0 GA; A2A Protocol now under Linux Foundation governance

---

## 07 · Decision Guide

Honest two-sided guidance.

### Use ADK when

- You're already on Google Cloud and standardising on Gemini
- You need bidirectional voice or video — Gemini Live integration is genuinely unique
- You're building hierarchical multi-agent systems with clear role delegation
- A2A interop matters — you want to mix ADK with LangGraph or CrewAI agents
- You want a managed runtime (Agent Engine) to handle sessions, memory, and scaling
- You're comfortable with weekly-to-bi-weekly framework churn during ADK 2.0 stabilisation

### Skip ADK when

- Your team already runs LangChain in production and the ecosystem familiarity is the win
- You need a single-file prototype, not a framework — a 50-line script with the OpenAI or Anthropic SDK is shorter
- You're on AWS or Azure and have no GCP plans — ADK runs there, but Agent Engine, Memory Bank, and the IAM integrations don't
- You need predictable monthly costs — Agent Engine plus per-token model billing plus Search grounding surcharges can be hard to forecast
- ADK 2.0's graph workflows are the headline feature you want — wait for GA before shipping production

---

## 08 · Imbila Perspective

Where ADK fits in our delivery model — and where it doesn't.

**Enterprise tier** — For South African banks, insurers, and telcos already on Google Cloud (or running Vertex AI for their ML workloads), ADK is a natural fit. Agent Engine with `VertexAiSessionService` and Memory Bank gives the audit trail, IAM controls, and data-residency story that POPIA and our regulators expect. We typically pair ADK orchestrators with the Johannesburg or Cape Town GCP regions to keep agent-to-tool latency under 50ms for customer-facing flows. The honest constraint: if the client's data lives mostly in AWS or on-prem, the cross-cloud egress and token-billing overhead usually makes a different framework cheaper.

**Studio tier** — For mid-market builds, ADK's deploy-to-Cloud-Run path is hard to beat. One container, scales to zero, no managed-runtime fees, A2A still works. We'll often start in `adk web` on a developer laptop, ship to Cloud Run for staging, and only move to Agent Engine if the client wants the managed sessions and Memory Bank UI. ADK 2.0 graph workflows are interesting for studio work — but we're keeping them out of production until GA.

**Dojo tier** — ADK is one of the better frameworks to learn agentic patterns on, because the abstractions are explicit. You can see the agent tree, the tool calls, the session state. Pair it with the [official quickstart](https://google.github.io/adk-docs/get-started/quickstart/), the free Gemini API key tier, and the open-source [`adk-samples`](https://github.com/google/adk-samples) repo, and you have a genuine learning path that doesn't require a credit card. The A2A Protocol is also worth learning here, because it's the open standard that lets your ADK agent talk to whatever framework comes next.

---

## 09 · Resources

### Official sources

- **ADK docs (canonical)** → [google.github.io/adk-docs](https://google.github.io/adk-docs/)
- **ADK Python repo** → [github.com/google/adk-python](https://github.com/google/adk-python)
- **ADK TypeScript repo** → [github.com/google/adk-js](https://github.com/google/adk-js)
- **ADK Go repo** → [github.com/google/adk-go](https://github.com/google/adk-go)
- **ADK Java repo** → [github.com/google/adk-java](https://github.com/google/adk-java)
- **ADK docs repo** → [github.com/google/adk-docs](https://github.com/google/adk-docs)
- **Community contributions** → [github.com/google/adk-python-community](https://github.com/google/adk-python-community)
- **Samples** → [github.com/google/adk-samples](https://github.com/google/adk-samples)
- **PyPI** → [pypi.org/project/google-adk](https://pypi.org/project/google-adk/)

### Standards and protocols

- **A2A Protocol (Linux Foundation)** → [github.com/a2aproject/A2A](https://github.com/a2aproject/A2A)
- **A2A specification** → [a2a-protocol.org](https://a2a-protocol.org/latest/)
- **Model Context Protocol (MCP)** → [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **OpenTelemetry GenAI Semantic Conventions** → [opentelemetry.io/docs/specs/semconv/gen-ai](https://opentelemetry.io/docs/specs/semconv/gen-ai/)

### Deployment guides

- **Deploy to Cloud Run** → [Google Cloud docs](https://docs.cloud.google.com/run/docs/ai/build-and-deploy-ai-agents/deploy-adk-agent)
- **Deploy to GKE** → [Google Cloud docs](https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/agentic-adk-vertex)
- **Deploy to Vertex AI Agent Engine** → [ADK docs](https://google.github.io/adk-docs/deploy/agent-engine/)

### Sources used and validated for this explainer

This page was assembled from primary sources only. Every claim about features, releases, licences, and behaviour is traceable to one of the following:

1. `google/adk-python` README, CHANGELOG, and release tags on GitHub
2. `google/adk-docs` site at [google.github.io/adk-docs](https://google.github.io/adk-docs/)
3. The `developers.googleblog.com` ADK launch post (April 9, 2025) and ADK Java 1.0 announcement (March 30, 2026)
4. `a2aproject/A2A` repository and the A2A Protocol specification site
5. Google Cloud official documentation for Cloud Run, GKE, and Vertex AI Agent Engine
6. Google Cloud Vertex AI pricing page for billing structure references

Where third-party comparisons are cited (framework comparisons in section 04, deployment trade-offs in section 07), we've cross-checked claims against the official ADK docs before including them. Anything we couldn't verify against a primary source was removed.

---

*Imbila.AI — AI Strategy & Implementation That Actually Delivers ROI · Johannesburg, South Africa · [imbila.ai](https://imbila.ai)*
