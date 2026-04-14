"use client";

import { Button } from "@/components/ui/button";

export default function EmpresasError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl text-center">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
      <p className="text-muted-foreground mb-6">
        {error.message || "Ocorreu um erro ao carregar as empresas."}
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
