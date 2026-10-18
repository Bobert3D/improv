import "server-only";
import { Ari, AriApiError, AriInputError } from "@hackclub/ari";
import { err, ok, type Result } from "@/lib/utils/result";


const ari = new Ari({
    programId: process.env.ARI_PROGRAM_ID!,
    signingSecret: process.env.ARI_SIGNING_SECRET!,
});


export type ShipInput = {
    project: {
        id: string;
        name: string | null;
        description: string | null;
        codeURL: string | null;
        demoURL: string | null;
        thumbnailURL: string | null;
        hackatimeProjects: string[];
        updateDeclaration: string | null;
        aiDeclaration: string | null;
        reviewStatus: string | null;

    };
    user: { email: string; name: string; slackId: string;}
};

function fail(message: string): Result<never> {
    return err([message]);
}


export async function submitShip({ project, user }: ShipInput): Promise<Result<string>> {
    try {
        const res = await ari.ships.create({
            external_id: project.id,
            title: project.name ?? "",
            description: project.description ?? "",
            repo_url: project.codeURL ?? "",
            demo_url: project.demoURL ?? "",
            thumbnail_url: project.thumbnailURL ?? "",
            maker: { email: user.email, name: user.name, slack_id: user.slackId },
            hackatime_projects: project.hackatimeProjects,
            is_update: project.reviewStatus !== null,
            update_message: project.updateDeclaration || undefined,
            meta: { ai_declaration: project.aiDeclaration },
        });
        return ok(res.id);
    } catch (e) {
        if (e instanceof AriInputError) {
            return fail(`Invalid ${e.field ?? "field"}: ${e.message}`);
        }
        if (e instanceof AriApiError) {
            return fail(`Ari rejected the project (${e.code})`);
        }
        return fail("Couldn't reach Ari, please try again");
    }
}

export async function withdrawShip(projectId: string): Promise<Result<null>> {
    try {
        await ari.ships.withdraw(projectId);
    }  catch (e) {
        if (!(e instanceof AriApiError && e.code === "not_queued")) {
            return fail("Couldn't withdraw from Ari, please try again");
        }
    }
    return ok(null);
}