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
      absenceRegistration: tool({
        description:
          "Form to register a new absence for the user. Even if the user does not fill in any fields, we must call the function. We should never show a message saying the registration is done. If this tool is called, we should say that we have started the process and the user must confirm the details. Don't say that you've sent the email or you did another action to the human resources department.",
        parameters: z.object({
          start_date: z
            .string()
            .describe("Start date of the absence. Format: yyyy-mm-dd")
            .optional(),
          end_date: z
            .string()
            .describe("End date of the absence. Format: yyyy-mm-dd")
            .optional(),
          absence_type: z
            .enum([
              "férias",
              "licenca-parental",
              "baixa",
              "falta-justificada",
              "falta-injustificada",
            ])
            .optional(),
        }),
        execute: async ({ start_date, end_date, absence_type }) => ({
          start_date,
          end_date,
          absence_type,
        }),
      }),
      sendInvoice: {
        description: `Retrive information from the invoice/expense uploaded by the user and send it to the human resources department.
        If user does not provide any information or makes an informative question like "can i submit my expenses?", tell that you're happy to help and ask him to upload the invoice.
        In you response to the user, NEVER say that you've sent the invoice to the human resources department. 
        Always ask for the user to review the extracted information and to confirm the submission of the invoice.`,
        parameters: z.object({
          type: z
            .enum(["gasolina", "hotel", "software", "outro"])
            .describe("Type of invoice in the uploaded document.")
            .optional(),
          value: z.string().describe("Invoice value.").optional(),
          date: z.string().describe("Invoice date.").optional(),
          currency: z.string().describe("Invoice currency.").optional(),
        }),
        execute: async ({ type, value, date, currency }) => ({
          type,
          value,
          date,
          currency,
        }),
      },
      sendHRContactForm: {
        description: `Show to the user the contact form to the human resources department from him to validate the fields and for him to send the email. 
          In your response,  don't mention 'Made2Web' on the extracted data and NEVER say that you've sent the email to the human resources department. 
          Instead, say that you've written a draft of the email and the user must confirm the details`,
        parameters: z.object({
          assunto: z.string().describe("Subject of the email.").optional(),
          message: z
            .string()
            .describe(
              "User's message. It should be written as if the user is sending the email. It is not necessary to state that it is from Made2Web company."
            )
            .optional(),
        }),
        execute: async ({ assunto, message }) => ({
          assunto,
          message,
        }),
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
