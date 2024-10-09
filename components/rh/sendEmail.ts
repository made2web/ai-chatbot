"use server";
import { Resend } from "resend";
import { EmailContactoRH } from "@/emails";

export async function sendEmail(subject: string, message: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const emailResponse = await resend.emails.send({
      from: "ana.coelho@resend.made2web.dev",
      to: "ricardo.nascimento@made2web.com",
      react: EmailContactoRH({ subject, message }),
      subject: subject,
    });
    console.log("Email enviado com sucesso:", emailResponse);
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}
