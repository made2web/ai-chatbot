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

            TOOLS:
            - get_information: Query the knowledge base.
            - absenceRegistration: Register a new absence for the user.
            - readInvoice: Read the user's invoice/expense.
            - sendHRContactForm: Send the contact form to the human resources department.

            If the user is looking for information, call \`get_information\` to query the knowledge base.
            If no relevant information is found:
            1) respond politely that you do not know the answer and to contact the human resources department
            2) Call the tool \`sendHRContactForm\`.

            If the user wants to register an absence (vacation, parental leave, sick leave, justified absence, or unjustified absence), call \`absenceRegistration\` to start the absence registration process. You should call the function even if the user does not fill in any fields.
            If the user wants to submit expenses, call \`readInvoice\` to handle the expense submission.

            You must always respond in European Portuguese.
            Only answer questions using information from tool calls.
            
            
            If no relevant information is found in the tool calls:
            1) respond politely that you do not know the answer and to contact the human resources department
            2) Call the tool \`sendHRContactForm\`.
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
        description: `Retrieve information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe("the question the user wants to know"),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      },
      absenceRegistration: tool({
        description:
          "Form to register a new absence for the user. Even if the user does not fill in any fields, we must call the function. We should never show a message saying the registration is done. If this tool is called, we should say that we have started the process and the user must confirm the details.",
        parameters: z.object({
          start_date: z.string().optional(),
          end_date: z.string().optional(),
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
      absenceConfirmation: {
        description:
          "Confirm the absence details for the user after registration.",
        parameters: z.object({
          start_date: z.string(),
          end_date: z.string(),
          absence_type: z.string(),
        }),
        execute: async ({ start_date, end_date, absence_type }) => ({
          start_date,
          end_date,
          absence_type,
        }),
      },
      readInvoice: {
        description:
          "Read the user's invoice/expense. When this tool is called we render a custom UI so the user can confirm the data in the fields. We didnt submit nothing. The user must verify and submit the invoice.",
        parameters: z.object({
          type: z
            .enum(["gasolina", "hotel", "software", "outro"])
            .describe("Type of invoice in the PDF.")
            .optional(),
          value: z
            .number()
            .describe(
              "Invoice value in the PDF in the currency shown in the PDF, do not convert"
            )
            .optional(),
          date: z.string().describe("Invoice date in the PDF.").optional(),
          currency: z
            .enum(["EUR", "USD"])
            .describe("Currency of the invoice in the PDF.")
            .optional(),
        }),
        execute: async ({ type, value, date, currency }) => ({
          type,
          value,
          date,
          currency,
        }),
      },
      sendHRContactForm: {
        description: "Send the contact form to the human resources department.",
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
