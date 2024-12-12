import { drizzle } from "drizzle-orm/postgres-js";
import { cosineDistance, desc, gt, sql, eq } from "drizzle-orm";
import postgres from "postgres";
import { genSaltSync, hashSync } from "bcrypt-ts";
import {
  user,
  chat,
  User,
  embeddings,
  ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "./schema";
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);
const embeddingModel = openai.embedding("text-embedding-ada-002");

export async function getUser(email: string): Promise<Array<User>> {
  return await db.select().from(user).where(eq(user.email, email));
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  return await db.insert(user).values({ email, password: hash });
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

  if (selectedChats.length > 0) {
    return await db
      .update(chat)
      .set({
        messages: JSON.stringify(messages),
      })
      .where(eq(chat.id, id));
  }

  return await db.insert(chat).values({
    id,
    createdAt: new Date(),
    messages: JSON.stringify(messages),
    userId,
  });
}

export async function deleteChatById({ id }: { id: string }) {
  return await db.delete(chat).where(eq(chat.id, id));
}

export async function getChatsByUserId({ id }: { id: string }) {
  return await db
    .select()
    .from(chat)
    .where(eq(chat.userId, id))
    .orderBy(desc(chat.createdAt));
}

export async function getChatById({ id }: { id: string }) {
  const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
  return selectedChat;
}

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);

  return similarGuides;
};

export async function createTicketInDb({
  title,
  description,
  priority,
  category,
}: {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
}) {
  try {
    console.log("priority", priority);
    console.log("category", category);
    const newTicket = await db
      .insert(ticket)
      .values({
        title,
        description,
        status: TicketStatus.ABERTO,
        priority,
        category,
      })
      .returning();

    console.log("Novo ticket criado:", newTicket);

    return { success: true, data: newTicket[0] };
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    return { success: false, error: "Erro ao criar ticket" };
  }
}

export async function getTicketByTicketNumber(ticketNumber: number) {
  try {
    const [selectedTicket] = await db
      .select()
      .from(ticket)
      .where(eq(ticket.ticketNumber, ticketNumber));

    if (!selectedTicket) {
      return {
        success: false,
        error: "Ticket não encontrado",
      };
    }

    return {
      success: true,
      data: selectedTicket,
    };
  } catch (error) {
    console.error("Erro ao buscar ticket:", error);
    return {
      success: false,
      error: "Erro ao buscar ticket",
    };
  }
}
