"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCNPJ, cleanCNPJ, validateCNPJ } from "@/lib/cnpj";
import { Loader2 } from "lucide-react";

interface CNPJInputProps {
  onDataFetched: (data: Record<string, unknown>) => void;
  onError: (error: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export function CNPJInput({
  onDataFetched,
  onError,
  value,
  onChange,
}: CNPJInputProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Cleanup debounce on unmount to prevent state updates after unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchCNPJ = useCallback(
    async (cnpj: string) => {
      setLoading(true);
      setStatus("idle");
      try {
        const res = await fetch(`/api/cnpj/${cnpj}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao buscar CNPJ");
        }
        const data = await res.json();
        setStatus("success");
        onDataFetched(data);
      } catch (err) {
        setStatus("error");
        onError(err instanceof Error ? err.message : "Erro ao buscar CNPJ");
      } finally {
        setLoading(false);
      }
    },
    [onDataFetched, onError]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    onChange(formatted);

    const digits = cleanCNPJ(formatted);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (digits.length === 14) {
      if (!validateCNPJ(digits)) {
        onError("CNPJ inválido — dígitos verificadores não conferem");
        setStatus("error");
        return;
      }
      setStatus("idle");
      debounceRef.current = setTimeout(() => fetchCNPJ(digits), 500);
    } else {
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cnpj">CNPJ</Label>
      <div className="relative">
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          value={value}
          onChange={handleChange}
          maxLength={18}
          className={
            status === "success"
              ? "border-green-500 pr-10"
              : status === "error"
                ? "border-red-500 pr-10"
                : "pr-10"
          }
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!loading && status === "success" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">
            ✓
          </span>
        )}
      </div>
    </div>
  );
}
