export const engineeringRoleIds = [
	"engineering-lead",
	"repository-auditor",
	"system-architect",
	"production-implementer",
	"test-engineer",
	"debugger",
	"code-reviewer",
	"integration-engineer",
	"lifecycle-steward",
	"security-reviewer",
	"release-qualifier",
	"research-agent",
	"frontend-specialist",
	"backend-data-specialist",
	"domain-governance",
] as const

export type EngineeringRoleId = (typeof engineeringRoleIds)[number]

export type EngineeringWorkStatus =
	| "planned"
	| "ready"
	| "running"
	| "blocked"
	| "waiting-review"
	| "verified"
	| "failed"
	| "cancelled"

export type EngineeringRisk = "low" | "medium" | "high" | "critical"

export interface EngineeringWorkItem {
	id: string
	parentId?: string
	title: string
	objective: string
	role: EngineeringRoleId
	status: EngineeringWorkStatus
	dependsOn: string[]
	writeScope?: string[]
	risk: EngineeringRisk
	providerProfileId?: string
	modelId?: string
	worktreePath?: string
	branchName?: string
	createdAt: number
	startedAt?: number
	completedAt?: number
}

export interface EngineeringCampaign {
	id: string
	title: string
	objective: string
	rootTaskId: string
	status: EngineeringWorkStatus
	workItems: EngineeringWorkItem[]
	createdAt: number
	updatedAt: number
}

export type EngineeringCapability =
	| "planning"
	| "architecture"
	| "coding"
	| "debugging"
	| "testing"
	| "review"
	| "research"
	| "frontend"
	| "backend"
	| "data"
	| "security"
	| "documentation"
	| "integration"
	| "qualification"
	| "long-context"
	| "tool-use"

export interface ModelRouteCandidate {
	providerProfileId: string
	modelId: string
	capabilities: EngineeringCapability[]
	costClass: 1 | 2 | 3 | 4 | 5
	qualityClass: 1 | 2 | 3 | 4 | 5
	latencyClass: 1 | 2 | 3 | 4 | 5
	maxConcurrent?: number
	enabled: boolean
}

export interface ModelRouteRequest {
	role: EngineeringRoleId
	requiredCapabilities: EngineeringCapability[]
	risk: EngineeringRisk
	preferLowCost?: boolean
	preferLowLatency?: boolean
	minimumQualityClass?: 1 | 2 | 3 | 4 | 5
}

export interface ModelRouteDecision {
	candidate: ModelRouteCandidate
	score: number
	reasons: string[]
}

export interface EngineeringReceipt {
	id: string
	campaignId: string
	workItemId: string
	type: "delegation" | "tool" | "test" | "review" | "provider" | "qualification" | "state"
	at: number
	summary: string
	details?: Record<string, unknown>
}
