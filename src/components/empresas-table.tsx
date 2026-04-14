"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCNPJ } from "@/lib/cnpj";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Empresa {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  situacaoCadastral: string | null;
  municipio: string | null;
  uf: string | null;
  createdAt: string;
}

interface PaginatedResponse {
  data: Empresa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function EmpresasTable() {
  const [response, setResponse] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "50",
    });
    if (search) params.set("search", search);

    fetch(`/api/empresas?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar empresas");
        return res.json();
      })
      .then((data) => setResponse(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      )
      .finally(() => setLoading(false));
  }, [page, search]);

  // Debounce search input
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const empresas = useMemo(() => response?.data ?? [], [response]);
  const pagination = response?.pagination;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={() => setPage(1)}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por razão social, CNPJ, nome fantasia ou cidade..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="max-w-md"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : empresas.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          {search
            ? "Nenhum resultado encontrado."
            : "Nenhuma empresa cadastrada ainda."}
        </p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Nome Fantasia</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-mono text-sm">
                      {formatCNPJ(empresa.cnpj)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {empresa.razaoSocial}
                    </TableCell>
                    <TableCell>{empresa.nomeFantasia || "—"}</TableCell>
                    <TableCell>
                      {empresa.municipio && empresa.uf
                        ? `${empresa.municipio}/${empresa.uf}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {empresa.situacaoCadastral ? (
                        <Badge
                          variant={
                            empresa.situacaoCadastral.toLowerCase() === "ativa"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {empresa.situacaoCadastral}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {pagination.total} empresa{pagination.total !== 1 && "s"} encontrada{pagination.total !== 1 && "s"}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center text-sm px-2">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
