import { Ari } from "@hackclub/ari";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { ariDeliveries, projects } from "@/lib/db/schema";

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
        const seen = await db.query.ariDeliveries.findFirst({
            where: eq(ariDeliveries.id, context.delivery_id),
        });
        if (seen) return;

        const status = STATUS[event.event];
        if (status && "external_id" in event) {
            await db
                .update(projects)
                .set({ reviewStatus: status })
                .where(eq(projects.id, event.external_id));
        }

        await db.insert(ariDeliveries).values({ id: context.delivery_id });
    },
});