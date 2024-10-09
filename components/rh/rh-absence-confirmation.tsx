import { format } from "date-fns";
import { CalendarIcon, CheckCircle2, FileTextIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";

import { absenceTypes } from "./const";
interface AbsenceConfirmationProps {
  summary: {
    absence_type: string;
    start_date: Date;
    end_date: Date;
  };
}

export function AbsenceConfirmation({
  summary = {
    absence_type: "férias",
    start_date: new Date(),
    end_date: new Date(),
  },
}: AbsenceConfirmationProps) {
  const absenceType = absenceTypes.find(
    (type) => type.value === summary.absence_type
  );

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Ausência Confirmada
          </CardTitle>
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
        <CardDescription>
          Detalhes da sua solicitação de ausência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <FileTextIcon className="mr-2 h-4 w-4" />
          <span className="font-semibold">Tipo:</span>
          <span className="ml-2">{absenceType?.label}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="font-semibold">Período:</span>
          </div>
          <div className="pl-6 space-y-1">
            <div>Início: {format(summary.start_date, "dd/MM/yyyy")}</div>
            {summary.end_date && (
              <div>Fim: {format(summary.end_date, "dd/MM/yyyy")}</div>
            )}
          </div>
        </div>
      </CardContent>
      {/* <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="destructive" onClick={onCancel}>
          Cancelar
        </Button>
      </CardFooter> */}
    </>
  );
}
