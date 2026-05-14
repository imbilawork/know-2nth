---
title: SA LLM residency — validation memo
scope: Cross-page consistency audit for know.2nth.ai
pages_affected:
  - https://know.2nth.ai/explainers/agents/gpt
  - https://know.2nth.ai/explainers/tech/microsoft/
date: 2026-05-14
---

# SA LLM residency — validation memo

A cross-page audit. Two `know.2nth.ai` explainers tell different stories about Claude on AWS in South Africa, and the Microsoft hub overstates Azure's residency position. Below: what's actually true as of May 2026, with primary sources, plus the line-edits that bring both pages into agreement with the facts.

01 · The short version

## What's wrong, in one paragraph.

`agents/gpt` says Claude has "Bedrock `af-south-1` for SA residency." `tech/microsoft` says "Microsoft is the only major LLM vendor with a South Africa inference region" and that "Azure OpenAI in `southafricanorth` is fully in country — both the resource and the inference compute are in Joburg." All three claims need tightening. AWS Bedrock in Cape Town is a regional endpoint, but Claude 4.5 inference itself routes globally via cross-Region inference — only logs stay in country. Azure OpenAI in `southafricanorth` only keeps inference in country on **Regional PTU** deployments — the default **Global Standard** SKU processes prompts globally. And Google Vertex AI's `africa-south1` (Johannesburg) is also a major-vendor SA inference region — so "only" is overstated either way.

02 · AWS Bedrock af-south-1

## What `af-south-1` actually delivers for Claude.

Amazon Bedrock went GA in Africa (Cape Town) alongside Canada West, Mexico Central, and Bahrain in November 2025. The regional endpoint is real. But the access pattern for Anthropic's Claude 4.5 family from `af-south-1` is **global cross-Region inference only**.

Per AWS's own announcement on the Machine Learning blog:

> "You can now invoke models from the Cape Town Region while Amazon Bedrock automatically routes requests to Regions with available capacity. Your applications get consistent response times, your users get reliable experiences, and your Amazon CloudWatch and AWS CloudTrail logs stay centralized in af-south-1."

In plain English: the API endpoint and the audit logs are in Cape Town. The GPU running Claude is somewhere else — US East, EU West, APAC — depending on capacity routing. AWS itself flags POPIA explicitly: customers "should evaluate alignment with regulatory obligations such as POPIA." That guidance only makes sense because customer prompts and completions leave the country.

For workloads where customer content can lawfully leave South Africa (most POPIA s.72 cases), this is fine and you get the latency benefit of an in-country endpoint plus useful regional logging. For workloads where prompts and grounding data must stay in country (SARB Directive 6, sovereign workloads, FAIS advisory containing client PII), `af-south-1` for Claude is **not** in-country inference.

**Primary source:**
- AWS ML Blog (Jan 2026) — *Scale AI in South Africa using Amazon Bedrock global cross-Region inference with Anthropic Claude 4.5 models*. https://aws.amazon.com/blogs/machine-learning/scale-ai-in-south-africa-using-amazon-bedrock-global-cross-region-inference-with-anthropic-claude-4-5-models/
- AWS What's New (Nov 2025) — *Amazon Bedrock is now available in additional Regions*. https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-bedrock-available-in-additional-regions/

03 · Azure OpenAI in southafricanorth

## What "in country" actually means on Azure.

Microsoft's data residency commitment splits into three deployment-type buckets, and the difference is the whole story.

| Deployment type | Data at rest | Inference compute |
|---|---|---|
| Global Standard | In customer-selected Geo | Any Microsoft Foundry region worldwide |
| DataZone Standard | In customer-selected Geo | Within US data zone or EU data zone (no SA data zone exists) |
| Standard (Regional) | In customer-selected Geo | Only in the deployment region |
| Provisioned Throughput (Regional PTU) | In customer-selected Geo | Only in the deployment region |

Source: Azure data residency page — Microsoft's verbatim contract language:

> "[For] any model deployment type labeled as 'Global,' may process prompts and completions sent to and output by that deployment, for inferencing or fine-tuning, in any Microsoft Foundry region globally."

So the question for `southafricanorth` is which deployment types are available there for current GPT models. Microsoft's Foundry Models retirement document (Apr 2026) tells us where Standard SKU lives today for the GPT line:

> "gpt-5.1 Standard was added to all eight regions that previously had those gpt-4o versions (centralus, eastus, eastus2, northcentralus, southcentralus, swedencentral, westus, westus3)."

**South Africa North is not in that list.** Pay-as-you-go Standard (Regional) for current GPT models does not run in country. The pay-as-you-go default — Global Standard — does not keep inference in country either.

What does work: **Regional Provisioned Throughput Units (PTU)** in `southafricanorth` for select GPT models. Microsoft confirmed the pattern in the parallel UAE North thread: "When you provision Azure OpenAI PTUs in [the region], inference (prompt and response processing) is designed to occur within the [regional] datacenter." Same architecture applies to SA North. The caveats also apply — abuse monitoring and telemetry may sample metadata cross-border.

So the honest claim is: **Azure OpenAI offers in-country inference in `southafricanorth` only via Regional PTU for the GPT models that have local capacity. The Global Standard SKU does not.** This is still a stronger SA residency story than AWS or Google currently offer for frontier models, but it requires the PTU path — and PTU has a meaningful minimum spend that filters out smaller workloads.

**Primary sources:**
- Azure Data Residency — https://azure.microsoft.com/en-us/explore/global-infrastructure/data-residency
- Foundry Models — deployment types — https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types
- Foundry Models lifecycle — confirms Standard SKU regions — https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements
- Microsoft Q&A — UAE North PTU residency clarification — https://learn.microsoft.com/en-us/answers/questions/5634629/

04 · Google Vertex AI in africa-south1

## The other major-vendor SA region.

The GPT explainer already names this in its competitor row: "Gemini (Google) ... JHB Vertex region." Vertex AI in `africa-south1` (Johannesburg) is a real GCP region. So the Microsoft page's "**only** major LLM vendor with a South Africa inference region" framing is contestable on its face — your own other explainer already contradicts it. Gemini availability and residency from `africa-south1` has the same deployment-type nuance as Azure (some models are regional, some route globally), and a full audit of which Gemini SKUs run locally is a separate research task. The point for this memo: the "only" framing has to go.

05 · The contradiction

## Side-by-side, what each page currently says.

| Claim | Page | Status |
|---|---|---|
| "Bedrock `af-south-1` for SA residency" (Claude row) | `agents/gpt` § 03 | **Misleading.** Regional endpoint + in-country logs only; Claude 4.5 inference routes globally via cross-Region inference. |
| "Microsoft is the only major LLM vendor with a South Africa inference region" | `tech/microsoft` hero copy | **Overstated.** Google Vertex AI has `africa-south1`; AWS Bedrock has `af-south-1`. Microsoft has the strongest *frontier-model* residency story via Regional PTU, but is not the only vendor with an SA region. |
| "Azure OpenAI in `southafricanorth` is fully in country — both the resource and the inference compute are in Joburg" | `tech/microsoft` § 02 footnote | **Half right.** True for Regional PTU deployments where the specific model has local capacity. False for the default Global Standard SKU, which is what most teams provision first. |

06 · Recommended edits

## Exact text replacements.

### `agents/gpt` — comparison table, Claude row

**Before:**
> Best instruction-following, native extended thinking, MCP-native, Bedrock `af-south-1` for SA residency

**After:**
> Best instruction-following, native extended thinking, MCP-native, Bedrock `af-south-1` endpoint with in-country logs (Claude 4.5 inference itself routes globally via cross-Region inference — not strict residency)

---

### `tech/microsoft` — hero copy

**Before:**
> Microsoft is the only major LLM vendor with a South Africa inference region. For the regulated workloads that have to keep prompts and grounding data in country — banking, healthcare, public sector, FAIS-covered advisory — that single fact is the deciding architectural input.

**After:**
> Microsoft offers the most mature path to in-country frontier-model inference in South Africa via Azure OpenAI Regional PTU in `southafricanorth`. Google Vertex AI's `africa-south1` and AWS Bedrock's `af-south-1` are also present in country, but for current frontier closed models neither matches Azure's Regional PTU residency guarantee. For regulated workloads that have to keep prompts and grounding data in country — banking, healthcare, public sector, FAIS-covered advisory — that asymmetry is the deciding architectural input.

---

### `tech/microsoft` — § 02 residency footnote

**Before:**
> **Azure OpenAI in `southafricanorth`** is fully in country — both the resource and the inference compute are in Joburg.

**After:**
> **Azure OpenAI in `southafricanorth`** keeps inference in country only on **Regional PTU** deployments — and currently only for the GPT model versions with local capacity. The default **Global Standard** SKU keeps data at rest in country but processes prompts and completions in any Microsoft Foundry region globally. The strict-residency path is Regional PTU; the pragmatic path is Global Standard with the M365 Geo data-at-rest commitment. Confirm specific model availability with Microsoft before architectural decisions — current GPT Standard SKU is documented in eight US/Sweden regions only, with SA North coverage via PTU.

07 · Why the original wording crept in

## A note on how this kind of drift happens.

The "only LLM in country" framing is true *if you read it narrowly enough* — Microsoft does have the most defensible frontier-model residency story among the majors via Regional PTU. But the unqualified version overstates the case in three ways:

1. It glosses the deployment-type distinction that decides whether inference actually stays in country.
2. It uses "only" when at least Google and AWS also have SA regions, even if their frontier-model residency posture is weaker.
3. It frames Azure as a single product when it's really three different products (Global, DataZone, Regional) sharing one resource type.

The same drift hit the Claude / Bedrock line on the GPT page — "Bedrock `af-south-1` for SA residency" is a fair shorthand only if your reader treats "residency" as covering the endpoint and logs. For SARB Directive 6 or strict POPIA s.72 use, it's not residency at all.

The fix is to keep the asymmetry — Microsoft really is the best frontier-model residency story in SA right now — while being honest that "in country" depends on deployment type and that Microsoft is not the only vendor with an SA inference region.

08 · Resources

## Primary sources.

- AWS Machine Learning Blog (Jan 2026) — *Scale AI in South Africa using Amazon Bedrock global cross-Region inference with Anthropic Claude 4.5 models* — https://aws.amazon.com/blogs/machine-learning/scale-ai-in-south-africa-using-amazon-bedrock-global-cross-region-inference-with-anthropic-claude-4-5-models/
- AWS What's New (Nov 2025) — *Amazon Bedrock is now available in additional Regions* — https://aws.amazon.com/about-aws/whats-new/2025/11/amazon-bedrock-available-in-additional-regions/
- Azure — Data residency global infrastructure — https://azure.microsoft.com/en-us/explore/global-infrastructure/data-residency
- Microsoft Learn — Foundry Models deployment types — https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types
- Microsoft Learn — Foundry Models sold directly by Azure — https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure
- Microsoft Learn — Foundry Models lifecycle and support policy — https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirements
- Microsoft Q&A (Nov 2025) — *Confirmation on Data Residency for Azure OpenAI PTUs in UAE North* (parallel architecture to SA North) — https://learn.microsoft.com/en-us/answers/questions/5634629/
- Microsoft Q&A (Feb 2026) — *Model availability in canada region with strict data residency* (same deployment-type logic applies) — https://learn.microsoft.com/en-us/answers/questions/5786353/

09 · GitHub references for working standards

## Open frameworks for residency-aware deployments.

- AWS Bedrock cross-Region inference profiles — https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html
- Azure OpenAI deployment types reference (Microsoft Learn, public docs source) — https://github.com/MicrosoftDocs/azure-docs/tree/main/articles/ai-services/openai
- Cloudflare AI Gateway — provider-agnostic observability and per-tenant routing that makes deployment-type swaps less painful — https://github.com/cloudflare/ai-gateway-docs
- Open Policy Agent (OPA) — for Azure Policy-style enforcement of `RequestedRegion` and SKU constraints on Bedrock and Azure OpenAI calls — https://github.com/open-policy-agent/opa
