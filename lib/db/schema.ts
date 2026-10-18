import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const project = pgTable("project", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	name: text("name"),
	description: text("description"),
	codeURL: text("code_url"),
	demoURL: text("demo_url"),
	updateDeclaration: text("update_declaration"),
	aiDeclaration: text("ai_declaration"),
	thumbnailURL: text("thumbnail_url"),
	hackatimeProjects: text("hackatime_projects").array().notNull().default([]),
	reviewStatus: text("review_status"),
	shipState: boolean("ship_state").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const order = pgTable("order", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	itemId: text("item_id").notNull(),
	quantity: integer("quantity").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ariDelivery = pgTable("ari_delivery", {
	id: text("id").primaryKey(),
});