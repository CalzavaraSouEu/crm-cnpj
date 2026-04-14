"use client";

import { useEffect, useState, use } from "react";
import { EmpresaForm } from "@/components/empresa-form";
import { Loader2 } from "lucide-react";

export default function EditarEmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [empresa, setEmpresa] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/empresas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Empresa não encontrada");
        return res.json();
      })
      .then((data) => setEmpresa(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erro ao carregar")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="mx-auto py-8 px-4 w-[80%]">
        <p className="text-red-500 text-center">{error || "Empresa não encontrada"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 px-4 w-[80%]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Editar Empresa</h1>
        <p className="text-muted-foreground mt-1">
          Altere os dados da empresa cadastrada
        </p>
      </div>
      <EmpresaForm empresaId={parseInt(id)} initialData={empresa} />
    </div>
  );
}
