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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Chame a server action para enviar o email
    const response = await sendEmail(subject, message);
    if (response.success) {
      console.log("Email enviado com sucesso");
    } else {
      console.error("Erro ao enviar email:", response.error);
    }
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Formulário de Contato</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit" onClick={handleSubmit}>
          Enviar
        </Button>
      </CardFooter>
    </Card>
  );
}
