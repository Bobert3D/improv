"use server";

import { getSession } from "@/lib/auth/utils";
import { revalidatePath } from "next/cache";
import z from "zod";
import {
	createProject,
	deleteProject,
	getProject,
	updateProject,
	updateProjectShipState,
} from "@/lib/projects/service";
import { submitShip, withdrawShip } from "@/lib/ari/service";
import extract from "@/lib/utils/form";
import { err, errParse, ok, type Result } from "@/lib/utils/result";

const CreateProjectFormSchema = z.object({
	name: z.string().nullish(),
	description: z.string().nullish(),
	codeURL: z.string().nullish(),
	demoURL: z.string().nullish(),
	updateDeclaration: z.string().nullish(),
	aiDeclaration: z.string().nullish(),
});

export async function createProjectAction(
	_prev: Result<string> | null,
	data: FormData,
) {
	const session = await getSession();
	if (!session.ok) return session;

	const parse = CreateProjectFormSchema.safeParse(extract(data));
	if (!parse.success) {
		return errParse(parse);
	}

	const result = await createProject(session.data.user.id, parse.data);
	if (result.ok) {
		revalidatePath("/app/project");
	}

	return result;
}

const UpdateProjectFormSchema = z.object({
	id: z.uuid(),

	name: z.string().optional(),
	description: z.string().optional(),
	codeURL: z.string().optional(),
	demoURL: z.string().optional(),
	updateDeclaration: z.string().optional(),
	aiDeclaration: z.string().optional(),
});

export async function updateProjectAction(
	_prev: Result<null> | null,
	data: FormData,
) {
	const session = await getSession();
	if (!session.ok) return session;

	const parse = UpdateProjectFormSchema.safeParse(extract(data));
	if (!parse.success) {
		return errParse(parse);
	}

	const result = await updateProject(
		session.data.user.id,
		parse.data.id,
		parse.data,
	);
	if (result.ok) {
		revalidatePath("/app/project");
	}

	return result;
}

const UpdateProjectShipStateFormSchema = z.object({
	id: z.uuid(),

	shipState: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export async function updateProjectShipStateAction(
	_prev: Result<null> | null,
	data: FormData,
) {
	const session = await getSession();
	if (!session.ok) return session;

	const parse = UpdateProjectShipStateFormSchema.safeParse(extract(data));
	if (!parse.success) {
		return errParse(parse);
	}

	const { id, shipState } = parse.data;
	const user = session.data.user;

	const project = await getProject(user.id, id);
	if (!project.ok) return project;

	if (project.data.shipState === shipState) return ok(null);

	if (shipState) {
		if (!user.slackId) {
			return err([
				"Your Slack ID is missing. Please sign out and sign back in.",
			]);
		}

		const ship = await submitShip({
			project: project.data,
			user: { email: user.email, name: user.name, slackId: user.slackId },
		});
		if (!ship.ok) return ship;
	} else {
		const withdrawn = await withdrawShip(id);
		if (!withdrawn.ok) return withdrawn;
	}

	const result = await updateProjectShipState(user.id, id, parse.data);
	if (result.ok) {
		revalidatePath("/app/project");
	}

	return result;
}

const DeleteProjectFormSchema = z.object({
	id: z.uuid(),
});

export async function deleteProjectAction(
	_prev: Result<null> | null,
	data: FormData,
) {
	const session = await getSession();
	if (!session.ok) return session;

	const parse = DeleteProjectFormSchema.safeParse(extract(data));
	if (!parse.success) {
		return errParse(parse);
	}

	const result = await deleteProject(session.data.user.id, parse.data.id);
	if (result.ok) {
		revalidatePath("/app/project");
	}

	return result;
}