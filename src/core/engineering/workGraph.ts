import type { EngineeringCampaign, EngineeringWorkItem } from "@roo-code/types"

export class EngineeringWorkGraphError extends Error {
	constructor(message: string) {
		super(message)
		this.name = "EngineeringWorkGraphError"
	}
}

export function validateEngineeringCampaign(campaign: EngineeringCampaign): void {
	const byId = new Map<string, EngineeringWorkItem>()

	for (const item of campaign.workItems) {
		if (byId.has(item.id)) {
			throw new EngineeringWorkGraphError(`Duplicate work item id: ${item.id}`)
		}
		byId.set(item.id, item)
	}

	if (!byId.has(campaign.rootTaskId)) {
		throw new EngineeringWorkGraphError(`Missing root work item: ${campaign.rootTaskId}`)
	}

	for (const item of campaign.workItems) {
		for (const dependencyId of item.dependsOn) {
			if (!byId.has(dependencyId)) {
				throw new EngineeringWorkGraphError(`Work item ${item.id} depends on missing item ${dependencyId}`)
			}
			if (dependencyId === item.id) {
				throw new EngineeringWorkGraphError(`Work item ${item.id} cannot depend on itself`)
			}
		}
		if (item.parentId && !byId.has(item.parentId)) {
			throw new EngineeringWorkGraphError(`Work item ${item.id} has missing parent ${item.parentId}`)
		}
	}

	const visiting = new Set<string>()
	const visited = new Set<string>()

	const visit = (id: string): void => {
		if (visited.has(id)) return
		if (visiting.has(id)) {
			throw new EngineeringWorkGraphError(`Dependency cycle detected at ${id}`)
		}
		visiting.add(id)
		for (const dependencyId of byId.get(id)?.dependsOn ?? []) visit(dependencyId)
		visiting.delete(id)
		visited.add(id)
	}

	for (const id of byId.keys()) visit(id)
}

export function getReadyEngineeringWork(campaign: EngineeringCampaign): EngineeringWorkItem[] {
	validateEngineeringCampaign(campaign)
	const byId = new Map(campaign.workItems.map((item) => [item.id, item]))

	return campaign.workItems.filter(
		(item) =>
			(item.status === "planned" || item.status === "ready") &&
			item.dependsOn.every((dependencyId) => byId.get(dependencyId)?.status === "verified"),
	)
}
