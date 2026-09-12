import type { ModelRouteCandidate, ModelRouteDecision, ModelRouteRequest } from "@roo-code/types"

const riskFloor = {
	low: 1,
	medium: 2,
	high: 4,
	critical: 5,
} as const

function hasCapabilities(candidate: ModelRouteCandidate, request: ModelRouteRequest): boolean {
	return request.requiredCapabilities.every((capability) => candidate.capabilities.includes(capability))
}

export function routeEngineeringModel(
	request: ModelRouteRequest,
	candidates: readonly ModelRouteCandidate[],
): ModelRouteDecision | undefined {
	const minimumQuality = Math.max(request.minimumQualityClass ?? 1, riskFloor[request.risk])

	const eligible = candidates.filter(
		(candidate) => candidate.enabled && candidate.qualityClass >= minimumQuality && hasCapabilities(candidate, request),
	)

	let best: ModelRouteDecision | undefined

	for (const candidate of eligible) {
		const reasons: string[] = [
			`quality ${candidate.qualityClass} meets floor ${minimumQuality}`,
			`covers ${request.requiredCapabilities.join(", ") || "baseline capability"}`,
		]
		let score = candidate.qualityClass * 100

		if (request.preferLowCost) {
			score += (6 - candidate.costClass) * 20
			reasons.push(`cost class ${candidate.costClass} rewarded`)
		}

		if (request.preferLowLatency) {
			score += (6 - candidate.latencyClass) * 10
			reasons.push(`latency class ${candidate.latencyClass} rewarded`)
		}

		// Deterministic tie-breaker: lower cost, then lower latency.
		score += 6 - candidate.costClass
		score += (6 - candidate.latencyClass) / 10

		if (!best || score > best.score) {
			best = { candidate, score, reasons }
		}
	}

	return best
}
