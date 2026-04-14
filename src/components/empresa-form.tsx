"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cleanCNPJ } from "@/lib/cnpj";
import {
  empresaFormSchema,
  FORM_FIELDS,
  type EmpresaFormData,
  type EmpresaFormInput,
} from "@/lib/schemas";
import { CNPJInput } from "./cnpj-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EmpresaForm() {
  const router = useRouter();
  const [cnpjValue, setCnpjValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmpresaFormInput, unknown, EmpresaFormData>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      cnpj: "",
      razaoSocial: "",
      nomeFantasia: "",
      situacaoCadastral: "",
      dataAbertura: "",
      naturezaJuridica: "",
      capitalSocial: "",
      porte: "",
      cnaePrincipal: "",
      cnaeDescricao: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      municipio: "",
      uf: "",
      cep: "",
      email: "",
      telefone: "",
    },
  });

  const handleCNPJData = useCallback(
    (data: Record<string, unknown>) => {
      for (const field of FORM_FIELDS) {
        if (data[field] != null) {
          setValue(field, String(data[field]), { shouldValidate: true });
        }
      }
      if (data.capitalSocial != null) {
        setValue("capitalSocial", String(data.capitalSocial), {
          shouldValidate: true,
        });
      }
      toast.success("Dados da empresa carregados com sucesso");
    },
    [setValue]
  );

  const handleCNPJChange = (value: string) => {
    setCnpjValue(value);
    setValue("cnpj", value, { shouldValidate: true });
  };

  const handleCNPJError = (error: string) => {
    toast.error(error);
  };

  const onSubmit = async (data: EmpresaFormData) => {
    setSubmitting(true);

    try {
      const payload = {
        cnpj: cleanCNPJ(data.cnpj),
        razaoSocial: data.razaoSocial,
        capitalSocial: data.capitalSocial
          ? parseFloat(data.capitalSocial)
          : null,
        nomeFantasia: data.nomeFantasia || null,
        situacaoCadastral: data.situacaoCadastral || null,
        dataAbertura: data.dataAbertura || null,
        naturezaJuridica: data.naturezaJuridica || null,
        porte: data.porte || null,
        cnaePrincipal: data.cnaePrincipal || null,
        cnaeDescricao: data.cnaeDescricao || null,
        logradouro: data.logradouro || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        municipio: data.municipio || null,
        uf: data.uf || null,
        cep: data.cep || null,
        email: data.email || null,
        telefone: data.telefone || null,
      };

      const res = await fetch("/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao cadastrar empresa");
      }

      toast.success("Empresa cadastrada com sucesso!");
      router.push("/empresas");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao cadastrar empresa"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldRow = (
    id: keyof EmpresaFormData,
    label: string,
    colSpan?: string
  ) => {
    const fieldError = (errors as FieldErrors<EmpresaFormData>)[id];
    return (
      <div className={colSpan || ""}>
        <Label htmlFor={id}>{label}</Label>
        <Input id={id} {...register(id)} />
        {fieldError?.message && (
          <p className="text-sm text-red-500 mt-1">{fieldError.message}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>
            Digite o CNPJ para buscar automaticamente os dados da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CNPJInput
            value={cnpjValue}
            onChange={handleCNPJChange}
            onDataFetched={handleCNPJData}
            onError={handleCNPJError}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldRow("razaoSocial", "Razão Social", "md:col-span-2")}
            {fieldRow("nomeFantasia", "Nome Fantasia", "md:col-span-2")}
            {fieldRow("situacaoCadastral", "Situação Cadastral")}
            {fieldRow("dataAbertura", "Data de Abertura")}
            {fieldRow("naturezaJuridica", "Natureza Jurídica", "md:col-span-2")}
            {fieldRow("capitalSocial", "Capital Social")}
            {fieldRow("porte", "Porte")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Econômica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldRow("cnaePrincipal", "CNAE Principal")}
            {fieldRow("cnaeDescricao", "Descrição CNAE")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {fieldRow("logradouro", "Logradouro", "md:col-span-3")}
            {fieldRow("numero", "Número")}
            {fieldRow("complemento", "Complemento", "md:col-span-2")}
            {fieldRow("bairro", "Bairro", "md:col-span-2")}
            {fieldRow("municipio", "Município", "md:col-span-2")}
            {fieldRow("uf", "UF")}
            {fieldRow("cep", "CEP")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldRow("email", "E-mail")}
            {fieldRow("telefone", "Telefone")}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/empresas")}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cadastrar Empresa
        </Button>
      </div>
    </form>
  );
}
