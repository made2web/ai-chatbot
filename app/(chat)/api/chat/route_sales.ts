import { convertToCoreMessages, streamText, tool } from "ai";
import { z } from "zod";

import { customModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  deleteChatById,
  findRelevantContent,
  getChatById,
  saveChat,
} from "@/db/queries";

function getCompanyByCAE(cae: string) {
  return `Company with CAE ${cae} not found`;
}

export async function POST(request: Request) {
  const { id, messages, selectedFilePathnames } = await request.json();

  const session = await auth();

  const result = await streamText({
    model: customModel,
    system: `\
            You are a friendly human resources assistant at Made2Web company, helping employees answer company-related questions and perform tasks like booking vacations or submitting expense receipts.
            
            If no relevant information is found in the tool calls:
            1) respond politely that you do not know the answer and to contact the human resources department
            2) Call the tool \`sendHRContactForm\`.

            ALWAYS answer in Portuguese from Portugal.
            
            The current date is ${new Date().toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })} so use it to answer the user's question.

      `,
    messages: convertToCoreMessages(messages),
    experimental_providerMetadata: {
      files: {
        selection: selectedFilePathnames,
      },
    },
    maxSteps: 2,
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
      getCompanyByCAE: {
        description: `Retrieve information about the company based on the CAE code. Generate a markdown response from the given results`,
        parameters: z.object({
          question: z.string().describe("the CAE code of the company"),
        }),
        execute: async ({ question }) => getCompanyByCAE(question),
      },
    },
    onFinish: async ({ text }) => {
      if (session && session.user && session.user.id) {
        await saveChat({
          id,
          messages: [...messages, { role: "assistant", content: text }],
          userId: session.user.id,
        });
      }
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
