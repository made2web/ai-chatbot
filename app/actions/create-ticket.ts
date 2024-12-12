"use server";

import { revalidatePath } from "next/cache";
import { createTicketInDb } from "@/db/queries";
import { TicketPriority, TicketCategory } from "@/db/schema";
import { generateObject } from "ai";
import { customModel } from "@/ai";
import { z } from "zod";
export async function createTicket(formData: FormData) {
  try {
    const title = formData.get("subject") as string;
    const description = formData.get("message") as string;

    const prioridades = Object.values(TicketPriority);
    const categorias = Object.values(TicketCategory);

    console.log("prioridades", prioridades);
    console.log("categorias", categorias);

    const { object } = await generateObject({
      model: customModel,
      schema: z.object({
        priority: z.enum(prioridades),
        category: z.enum(categorias),
      }),
      prompt: `
        Classify the following ticket into a priority and category:
        Title: ${title}
        Description: ${description} 
      `,
    });

    console.log("resultadoss", object);

    const result = await createTicketInDb({
      title,
      description,
      priority: object.priority,
      category: object.category,
    });

    return result;
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    return { success: false, error: "Erro ao criar ticket" };
  }
}
