"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/card";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Button } from "@/components/shadcn/button";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";

// Definindo o schema
interface ManageExpensesProps {
  summary: {
    type: string;
    value: string;
    currency: string;
    date: Date;
  };
}

export default function ManageExpenses({ summary }: ManageExpensesProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        {!submitted && (
          <CardTitle className="text-2xl font-bold">Despesa</CardTitle>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {submitted ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <span className="text-lg font-semibold">Despesa Submetida</span>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select defaultValue={summary?.type || undefined}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasolina">Gasolina</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <div className="w-1/2">
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  value={summary?.value || undefined}
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="currency">Moeda</Label>
                <Select defaultValue={summary?.currency || undefined}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Selecione uma moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euros</SelectItem>
                    <SelectItem value="USD">Dólares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={format(summary?.date || new Date(), "yyyy-MM-dd")}
                readOnly
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        {!submitted && (
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "A enviar..." : "Confirmar"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
