import { Ari } from "@hackclub/ari";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ariDelivery, project } from "@/lib/db/schema";

const STATUS: Record<string, string> = {
    "review.approved": "approved",
    "review.changes": "changes",
    "review.rejected": "rejected",
    "review.reverted": "pending",
    "review.requeued": "pending",
};

export const POST = Ari.webhooks.createHandler({
    secret: process.env.ARI_WEBHOOK_SECRET!,
    async on_event(event, context) {
        const seen = await db
            .select()
            .from(ariDelivery)
            .where(eq(ariDelivery.id, context.delivery_id));
        if (seen.length > 0) return;

        const status = STATUS[event.event];
        if (status && "external_id" in event) {
            await db
                .update(project)
                .set({ reviewStatus: status })
                .where(eq(project.id, event.external_id));
        }

        await db.insert(ariDelivery).values({ id: context.delivery_id });
    },
});