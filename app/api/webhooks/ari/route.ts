import { Ari } from "@hackclub/ari";
import { processWebhookEvent } from "./ari.service";

export const runtime = "edge";

export const POST = Ari.webhooks.createHandler({
    secret: process.env.ARI_WEBHOOK_SECRET!,
    async on_event(event, context) {
        
        await processWebhookEvent(event, context);
        
    },
});
