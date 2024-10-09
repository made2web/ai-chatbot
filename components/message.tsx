"use client";

import { Attachment, Message as MessageType, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";

import { AbsenceConfirmation } from "./rh/rh-absence-confirmation";
import { AbsenceRegistration } from "./rh/rh-absence-registration";
import { ContactForm } from "./rh/form-contact";
import ManageExpenses from "./rh/manage-expenses";
import { Weather } from "./weather";

export const Message = ({
  role,
  content,
  toolInvocations,
  attachments,
  append,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  append: (message: MessageType) => void;
}) => {
  //Se nao tiver content e só tiver uma tool invocation e for a getInformation, então não renderizar nada e o estado diferente de result

  if (
    !content &&
    toolInvocations &&
    toolInvocations.length === 1 &&
    toolInvocations[0].toolName === "getInformation" &&
    toolInvocations[0].state === "result"
  ) {
    return null;
  }

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content as string}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              console.log(toolInvocation);
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : null}
                    {toolName === "absenceRegistration" ? (
                      <AbsenceRegistration summary={result} append={append} />
                    ) : null}
                    {toolName === "absenceConfirmation" ? (
                      <AbsenceConfirmation summary={result} />
                    ) : null}
                    {toolName === "readInvoice" ? (
                      <ManageExpenses summary={result} />
                    ) : null}
                    {toolName === "sendHRContactForm" ? (
                      <ContactForm
                        initialSubject={result.assunto}
                        initialMessage={result.message}
                      />
                    ) : null}

                    {/* {toolName === "getInformation" ? (
                      <div>
                        aa
                        <Markdown>{JSON.stringify(result, null, 2)}</Markdown>
                      </div>
                    ) : null} */}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? <Weather /> : null}
                    {toolName === "getInformation" ? (
                      <div>A pesquisar...</div>
                    ) : null}
                    {toolName === "absenceRegistration" ? (
                      <div>A carregar absenceRegistration...</div>
                    ) : null}
                    {toolName === "absenceConfirmation" ? (
                      <div>A carregar absenceConfirmation...</div>
                    ) : null}
                    {toolName === "sendExpenseInvoice" ? (
                      <div>A carregar sendExpenseInvoice...</div>
                    ) : null}
                    {toolName === "readInvoice" ? (
                      <div>A carregar readInvoice...</div>
                    ) : null}
                    {toolName === "sendHRContactForm" ? (
                      <div>A carregar sendHRContactForm...</div>
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
