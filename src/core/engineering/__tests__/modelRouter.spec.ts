import { describe, expect, it } from "vitest"

import type { ModelRouteCandidate, ModelRouteRequest } from "@roo-code/types"

import { routeEngineeringModel } from "../modelRouter"

const candidates: ModelRouteCandidate[] = [
	{
		providerProfileId: "cheap",
		modelId: "worker",
		capabilities: ["coding", "tool-use"],
		costClass: 1,
		qualityClass: 3,
		latencyClass: 2,
		enabled: true,
	},
	{
		providerProfileId: "strong",
		modelId: "reviewer",
		capabilities: ["coding", "review", "security", "tool-use"],
		costClass: 4,
		qualityClass: 5,
		latencyClass: 3,
		enabled: true,
	},
]

describe("routeEngineeringModel", () => {
	it("uses a lower-cost capable worker for low-risk work", () => {
		const request: ModelRouteRequest = {
			role: "production-implementer",
			requiredCapabilities: ["coding", "tool-use"],
			risk: "low",
			preferLowCost: true,
			minimumQualityClass: 2,
		}

		expect(routeEngineeringModel(request, candidates)?.candidate.providerProfileId).toBe("cheap")
	})

	it("raises the quality floor for critical work", () => {
		const request: ModelRouteRequest = {
			role: "security-reviewer",
			requiredCapabilities: ["security", "review"],
			risk: "critical",
			preferLowCost: true,
		}

		expect(routeEngineeringModel(request, candidates)?.candidate.providerProfileId).toBe("strong")
	})

	it("returns undefined when no candidate satisfies the contract", () => {
		const request: ModelRouteRequest = {
			role: "research-agent",
			requiredCapabilities: ["research", "long-context"],
			risk: "medium",
		}

		expect(routeEngineeringModel(request, candidates)).toBeUndefined()
	})
})
