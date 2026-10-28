import { and, eq, type InferSelectModel } from "drizzle-orm";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { err, errParse, ok, type Result } from "@/lib/utils/result";
import {
	type CreateProjectInput,
	CreateProjectSchema,
	type UpdateProjectInput,
	UpdateProjectSchema,
	UpdateProjectShipState,
	UpdateProjectShipStateInput,
} from "./schema";

type SelectProject = InferSelectModel<typeof project>;

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

export async function createProject(
	userId: string,
	input: CreateProjectInput,
): Promise<Result<string>> {
	const parse = CreateProjectSchema.safeParse(input);
	if (!parse.success) return errParse(parse);

	const data = {
		...input,
		userId: userId,
	};

	try {
		const [result] = await db
			.insert(project)
			.values(data)
			.returning({ id: project.id });
		return ok(result.id);
	} catch (e) {
		return err(["Failed to create project"]);
	}
}

export async function updateProject(
	userId: string,
	projectId: string,
	input: UpdateProjectInput,
): Promise<Result<null>> {
	const parse = UpdateProjectSchema.safeParse(input);
	if (!parse.success) return errParse(parse);

	try {
		await db
			.update(project)
			.set(parse.data)
			.where(and(eq(project.userId, userId), eq(project.id, projectId)));
		return ok(null);
	} catch (e) {
		return err(["Failed to update project"]);
	}
}

export async function updateProjectShipState(
	userId: string,
	projectId: string,
	input: UpdateProjectShipStateInput,
): Promise<Result<null>> {
	const parse = UpdateProjectShipState.safeParse(input);
	if (!parse.success) return errParse(parse);

	try {
		const [result] = await db
			.select()
			.from(project)
			.where(and(eq(project.userId, userId), eq(project.id, projectId)))
			.limit(1);
		if (!result) throw new Error("Project not found");

		const oldShipState = result.shipState;
		const newShipState = parse.data.shipState;

		if (oldShipState === newShipState) return ok(null);

		await db
			.update(project)
			.set(parse.data)
			.where(and(eq(project.userId, userId), eq(project.id, projectId)));

		return ok(null);
	} catch (e) {
		return err(["Failed to update project ship state"]);
	}
}

export async function deleteProject(
	userId: string,
	projectId: string,
): Promise<Result<null>> {
	try {
		await db
			.delete(project)
			.where(and(eq(project.userId, userId), eq(project.id, projectId)));
		return ok(null);
	} catch (e) {
		return err(["Failed to delete project"]);
	}
}
