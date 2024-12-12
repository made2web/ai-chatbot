import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Ticket } from "@/db/schema";

const formatDate = (date: Date | string | undefined) => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return isNaN(d.getTime()) ? "Data Inválida" : d.toLocaleDateString();
};

export default function TicketStatusCard({ ticket }: { ticket: Ticket }) {
  const statusColor = {
    aberto: "bg-blue-500",
    em_andamento: "bg-yellow-500",
    pendente: "bg-orange-500",
    resolvido: "bg-green-500",
    fechado: "bg-gray-500",
  }[ticket.status];

  const priorityColor = {
    baixa: "bg-green-200 text-green-800",
    média: "bg-yellow-200 text-yellow-800",
    alta: "bg-orange-200 text-orange-800",
    urgente: "bg-red-200 text-red-800",
  }[ticket.priority];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Ticket #{ticket.ticketNumber}</span>
          <Badge className={statusColor}>{ticket.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-lg mb-2">{ticket.title}</h3>
        <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">{ticket.category}</Badge>
          <Badge className={priorityColor}>{ticket.priority}</Badge>
        </div>
        <div className="text-sm text-gray-500">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Criado em: {formatDate(ticket.createdAt)}
          </div>
          <div className="flex items-center mt-1">
            <ClockIcon className="w-4 h-4 mr-2" />
            Atualizado em: {formatDate(ticket.updatedAt)}
          </div>
        </div>
      </CardContent>
      {ticket.resolvedAt && (
        <CardFooter>
          <p className="text-sm text-green-600">
            Resolvido em: {formatDate(ticket.resolvedAt)}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
