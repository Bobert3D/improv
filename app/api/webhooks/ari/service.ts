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

export async function processWebhookEvent(event: any, context: any) {
    
    
    const seen = await db
        .select()
        .from(ariDelivery)
        .where(eq(ariDelivery.id, context.delivery_id));
        
    if (seen.length > 0) {
        console.log(`Delivery ${context.delivery_id} already processed. Skipping!`);
        return;
    }

 
    const status = STATUS[event.event];
    
    if (status && "external_id" in event) {
        await db
            .update(project)
            .set({ reviewStatus: status })
            .where(eq(project.id, event.external_id));
    } else {
        console.log(`Unhandled or unmappable Ari event: ${event.event}`);
    }

    await db
        .insert(ariDelivery)
        .values({ id: context.delivery_id });
}
