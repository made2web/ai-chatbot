"use client";

import { useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useActions } from "ai/rsc";
import { CheckCircle2 } from "lucide-react"; // Importar o ícone de confirmação

import { Button } from "@/components/shadcn/button";
import { Calendar } from "@/components/shadcn/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";

import { absenceTypes } from "./const";
import { cn } from "@/utils/shadcn/functions";
import { Message } from "ai";
import { generateUUID } from "@/utils/functions";
import { AbsenceConfirmation } from "./rh-absence-confirmation"; // Importar o componente de confirmação

interface AbsenceRegistrationProps {
  summary: {
    absence_type: string | undefined;
    start_date: Date;
    end_date: Date;
  };
}

export function AbsenceRegistration({
  summary = {
    absence_type: undefined,
    start_date: new Date(),
    end_date: new Date(),
  },
}: AbsenceRegistrationProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: summary.start_date || new Date(),
    to: summary.end_date || addDays(new Date(), 7),
  });
  const [absenceType, setAbsenceType] = useState<string | undefined>(
    summary.absence_type
  );
  const [submitted, setSubmitted] = useState(false); // Adicionar estado de submissão
  const [isSending, setIsSending] = useState(false); // Adicionar estado para controlar o texto do botão

  const handleConfirm = () => {
    setIsSending(true); // Alterar o estado para indicar que está enviando
    setTimeout(() => {
      setSubmitted(true);
      setIsSending(false); // Resetar o estado após a submissão
    }, 1500); // Simular atraso de 1,5 segundos
  };

  return (
    <Card className="w-full">
      <CardHeader>
        {!submitted && (
          <>
            <CardTitle>Registar Ausência</CardTitle>
            <CardDescription>
              Selecione o tipo e as datas da sua ausência
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {submitted ? ( // Mover mensagem de sucesso para dentro do CardContent
          <div className="flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <span className="text-lg font-semibold">Ausência Submetida</span>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              <Select value={absenceType} onValueChange={setAbsenceType}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Selecione o tipo de ausência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipo de Ausência</SelectLabel>
                    {absenceTypes.map((absenceType) => (
                      <SelectItem
                        key={absenceType.value}
                        value={absenceType.value}
                      >
                        {absenceType.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!submitted && (
          <>
            <Button variant="outline" onClick={() => setDate(undefined)}>
              Limpar
            </Button>
            <Button onClick={handleConfirm}>
              {isSending ? "A enviar..." : "Confirmar"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export function AbsenceRegistrationSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="h-6 bg-gray-300 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mt-2 animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="h-10 bg-gray-300 rounded w-full animate-pulse"></div>
          <div className="h-10 bg-gray-300 rounded w-full animate-pulse"></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="h-10 bg-gray-300 rounded w-1/4 animate-pulse"></div>
        <div className="h-10 bg-gray-300 rounded w-1/4 animate-pulse"></div>
      </CardFooter>
    </Card>
  );
}
