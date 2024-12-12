import { convertToCoreMessages, streamText, tool } from "ai";
import { z } from "zod";

import { customModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  deleteChatById,
  findRelevantContent,
  getChatById,
  saveChat,
  getTicketByTicketNumber,
} from "@/db/queries";

export async function POST(request: Request) {
  const { id, messages, selectedFilePathnames } = await request.json();

  const session = await auth();

  const result = await streamText({
    model: customModel,
    system: `\
            You are a friendly IT Support assistant at Carmo company, helping employees answer IT related questions and perform tasks like opening a ticket or showing the status of a ticket.
            
            If no relevant information is found in the tool calls:
            1) respond politely that you do not know the answer and to contact the IT department
            2) Call the tool \`openTicket\`.

            ALWAYS answer in Portuguese from Portugal.
            
            The current date is ${new Date().toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })} so use it to answer the user's question.

            Only reply with information that you have in your knowledge base. If you don't have the answer, call the tool \`openTicket\`.

      `,
    messages: convertToCoreMessages(messages),
    experimental_providerMetadata: {
      files: {
        selection: selectedFilePathnames,
      },
    },
    maxSteps: 3,
    maxRetries: 2,
    temperature: 0,

    tools: {
      getInformation: {
        description: `Retrieve information from your knowledge base to answer questions. Generate a markdown response from the given results`,
        parameters: z.object({
          question: z.string().describe("the question the user wants to know"),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      },
      openTicket: {
        description: `Show to the user the contact form to the IT department from him to validate the fields and for him to send the email. 
          In your response,  don't mention 'Carmo' on the extracted data and NEVER say that you've sent the email to the IT department.
          Dont repeat the question or the subject, instead, say that you don't have the answer and you've written a draft of the email and the user must confirm the details`,
        parameters: z.object({
          assunto: z.string().describe("The title of the ticket.").optional(),
          message: z
            .string()
            .describe(
              "The description of the ticket. It should be written as if the user is sending the email. It is not necessary to state that it is from Carmo company."
            )
            .optional(),
        }),
        execute: async ({ assunto, message }) => ({
          assunto,
          message,
        }),
      },
      statusTicket: {
        description: `Check the status of a ticket. If the user asks for the status of a ticket, you must call this tool. If they dont provide the ticket number, you must ask for it.`,
        parameters: z.object({
          ticketNumber: z.number().describe("The number of the ticket."),
        }),
        execute: async ({ ticketNumber }) =>
          getTicketByTicketNumber(ticketNumber),
      },
      extractErrorFromImage: {
        description: `Extract the error from the image.`,
        parameters: z.object({
          error: z.string().describe("The error message."),
        }),
        execute: async ({ error }) => error,
      },
    },
    onStepFinish({ toolResults, usage }) {
      // // This callback is called after each step
      // console.log("Step finished:", { toolResults, usage });
      // // You can save this information to your database or analytics service
    },
    onFinish: async ({ text, steps }) => {
      if (session && session.user && session.user.id) {
        await saveChat({
          id,
          messages: [...messages, { role: "assistant", content: text }],
          userId: session.user.id,
        });
      }

      // // This callback is called when the entire generation is complete
      // console.log("Generation finished. Total steps:", steps.length);
      // // You can aggregate usage data from all steps here
      // const totalTokens = steps.reduce(
      //   (sum, step) => sum + (step.usage?.totalTokens || 0),
      //   0
      // );
      // console.log("Total tokens used:", totalTokens);
      // // Save this information to your database or analytics service
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
