"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Label } from "@/components/shadcn/label";
import { sendEmail } from "@/components/rh/sendEmail"; // Importe a função de envio de email
import { CheckCircle2 } from "lucide-react"; // Importar o ícone de check circle

interface ContactFormProps {
  initialSubject?: string;
  initialMessage?: string;
}

export function ContactForm({
  initialSubject = "",
  initialMessage = "",
}: ContactFormProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [submitted, setSubmitted] = useState(false); // Adicionar estado de submissão
  const [isSending, setIsSending] = useState(false); // Adicionar estado para controlar o texto do botão

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true); // Alterar o estado para indicar que está enviando
    // Chame a server action para enviar o email
    const response = await sendEmail(subject, message);
    if (response.success) {
      setSubmitted(true); // Alterar o estado para indicar que foi submetido
    } else {
      console.error("Erro ao enviar email:", response.error);
    }
    setIsSending(false); // Resetar o estado após a tentativa de envio
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>
        {!submitted && <CardTitle>Formulário de Contato</CardTitle>}
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <span className="text-lg font-semibold">
              Email Enviado com Sucesso
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Digite o assunto"
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem"
                required
              />
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {!submitted && (
          <Button type="submit" onClick={handleSubmit} disabled={isSending}>
            {isSending ? "A enviar..." : "Enviar"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
