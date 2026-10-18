export async function listProjects(
	userId: string,
): Promise<Result<SelectProject[]>> {
	try {
		const result = await db
			.select()
			.from(project)
			.where(eq(project.userId, userId));
		return ok(result);
	} catch (e) {
		return err(["Failed to list projects"]);
	}
}

export async function getProject(
	userId: string,
	projectId: string,
): Promise<Result<SelectProject>> {
	try {
		const [result] = await db
			.select()
			.from(project)
			.where(and(eq(project.userId, userId), eq(project.id, projectId)))
			.limit(1);
		if (!result) return err(["Project not found"]);
		return ok(result);
	} catch (e) {
		return err(["Failed to get project"]);
	}
}