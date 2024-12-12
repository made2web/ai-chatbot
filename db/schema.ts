import { nanoid } from "@/utils/functions";
import { Message } from "ai";
import { InferSelectModel, sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  vector,
  index,
  serial,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

export const resources = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 }).references(
      () => resources.id,
      { onDelete: "cascade" }
    ),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);

export const TicketStatus = {
  ABERTO: "aberto",
  EM_ANDAMENTO: "em_andamento",
  PENDENTE: "pendente",
  RESOLVIDO: "resolvido",
  FECHADO: "fechado",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  BAIXA: "baixa",
  MEDIA: "média",
  ALTA: "alta",
  URGENTE: "urgente",
} as const;

export type TicketPriority =
  (typeof TicketPriority)[keyof typeof TicketPriority];

export const TicketCategory = {
  SALESFORCE: "salesforce",
  PRIMAVERA: "primavera",
  CONSUMIVEIS: "consumiveis",
  WEBSITE: "website",
  REDES: "redes",
  EMAIL: "email",
  ACESSOS: "acessos",
  SEGURANCA: "seguranca",
  OUTROS: "outros",
} as const;

export type TicketCategory =
  (typeof TicketCategory)[keyof typeof TicketCategory];

export const ticket = pgTable("Ticket", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  ticketNumber: serial("ticket_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 50 })
    .notNull()
    .default(TicketStatus.ABERTO)
    .$type<TicketStatus>(),
  priority: varchar("priority", { length: 20 })
    .notNull()
    .default(TicketPriority.MEDIA)
    .$type<TicketPriority>(),
  category: varchar("category", { length: 100 })
    .notNull()
    .default(TicketCategory.OUTROS)
    .$type<TicketCategory>(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
  resolvedAt: timestamp("resolved_at"),
});

export type Ticket = InferSelectModel<typeof ticket>;
