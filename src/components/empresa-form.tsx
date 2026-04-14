"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type FieldErrors } from "react-hook-form";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EmpresaFormProps {
  empresaId?: number;
  initialData?: Record<string, unknown>;
}

export function EmpresaForm({ empresaId, initialData }: EmpresaFormProps = {}) {
  const router = useRouter();
  const isEditing = !!empresaId;

  const buildDefaults = () => {
    if (!initialData) {
      return {
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
        socios: [] as { nome: string; cpfCnpj: string; qualificacao: string; dataEntrada: string; faixaEtaria: string }[],
      };
    }
    return {
      cnpj: String(initialData.cnpj || ""),
      razaoSocial: String(initialData.razaoSocial || ""),
      nomeFantasia: String(initialData.nomeFantasia || ""),
      situacaoCadastral: String(initialData.situacaoCadastral || ""),
      dataAbertura: String(initialData.dataAbertura || ""),
      naturezaJuridica: String(initialData.naturezaJuridica || ""),
      capitalSocial: initialData.capitalSocial != null ? String(initialData.capitalSocial) : "",
      porte: String(initialData.porte || ""),
      cnaePrincipal: String(initialData.cnaePrincipal || ""),
      cnaeDescricao: String(initialData.cnaeDescricao || ""),
      logradouro: String(initialData.logradouro || ""),
      numero: String(initialData.numero || ""),
      complemento: String(initialData.complemento || ""),
      bairro: String(initialData.bairro || ""),
      municipio: String(initialData.municipio || ""),
      uf: String(initialData.uf || ""),
      cep: String(initialData.cep || ""),
      email: String(initialData.email || ""),
      telefone: String(initialData.telefone || ""),
      socios: Array.isArray(initialData.socios)
        ? (initialData.socios as Record<string, unknown>[]).map((s) => ({
            nome: String(s.nome || ""),
            cpfCnpj: String(s.cpfCnpj || ""),
            qualificacao: String(s.qualificacao || ""),
            dataEntrada: String(s.dataEntrada || ""),
            faixaEtaria: String(s.faixaEtaria || ""),
          }))
        : [],
    };
  };

  const [cnpjValue, setCnpjValue] = useState(
    initialData ? String(initialData.cnpj || "") : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EmpresaFormInput, unknown, EmpresaFormData>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: buildDefaults(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socios",
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
      if (Array.isArray(data.socios)) {
        setValue(
          "socios",
          data.socios.map((s: Record<string, unknown>) => ({
            nome: String(s.nome || ""),
            cpfCnpj: String(s.cpfCnpj || ""),
            qualificacao: String(s.qualificacao || ""),
            dataEntrada: String(s.dataEntrada || ""),
            faixaEtaria: String(s.faixaEtaria || ""),
          }))
        );
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
        socios: data.socios
          .filter((s) => s.nome.trim())
          .map((s) => ({
            nome: s.nome,
            cpfCnpj: s.cpfCnpj || null,
            qualificacao: s.qualificacao || null,
            dataEntrada: s.dataEntrada || null,
            faixaEtaria: s.faixaEtaria || null,
          })),
      };

      const url = isEditing ? `/api/empresas/${empresaId}` : "/api/empresas";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Erro ao ${isEditing ? "atualizar" : "cadastrar"} empresa`);
      }

      toast.success(`Empresa ${isEditing ? "atualizada" : "cadastrada"} com sucesso!`);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fieldRow("razaoSocial", "Razão Social", "sm:col-span-2 lg:col-span-3")}
            {fieldRow("nomeFantasia", "Nome Fantasia", "sm:col-span-2 lg:col-span-3")}
            {fieldRow("situacaoCadastral", "Situação Cadastral")}
            {fieldRow("dataAbertura", "Data de Abertura")}
            {fieldRow("naturezaJuridica", "Natureza Jurídica")}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fieldRow("cnaePrincipal", "CNAE Principal")}
            {fieldRow("cnaeDescricao", "Descrição CNAE", "sm:col-span-1 lg:col-span-2")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {fieldRow("logradouro", "Logradouro", "sm:col-span-2 lg:col-span-4")}
            {fieldRow("numero", "Número", "lg:col-span-1")}
            {fieldRow("complemento", "Complemento", "lg:col-span-1")}
            {fieldRow("bairro", "Bairro", "lg:col-span-2")}
            {fieldRow("municipio", "Município", "lg:col-span-2")}
            {fieldRow("uf", "UF", "lg:col-span-1")}
            {fieldRow("cep", "CEP", "lg:col-span-1")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fieldRow("email", "E-mail")}
            {fieldRow("telefone", "Telefone")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sócios e Administradores</CardTitle>
          <CardDescription>
            Quadro societário da empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 font-medium w-[30%]">Nome</th>
                    <th className="text-left p-2 font-medium w-[20%]">CPF/CNPJ</th>
                    <th className="text-left p-2 font-medium w-[25%]">Qualificação</th>
                    <th className="text-left p-2 font-medium w-[15%]">Entrada</th>
                    <th className="p-2 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-0">
                      <td className="p-2">
                        <Input
                          {...register(`socios.${index}.nome`)}
                          placeholder="Nome do sócio"
                          className="h-8"
                        />
                        {errors.socios?.[index]?.nome && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.socios[index].nome.message}
                          </p>
                        )}
                      </td>
                      <td className="p-2">
                        <Input
                          {...register(`socios.${index}.cpfCnpj`)}
                          placeholder="CPF/CNPJ"
                          className="h-8"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          {...register(`socios.${index}.qualificacao`)}
                          placeholder="Qualificação"
                          className="h-8"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          {...register(`socios.${index}.dataEntrada`)}
                          placeholder="Data"
                          className="h-8"
                        />
                      </td>
                      <td className="p-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum sócio cadastrado. Busque um CNPJ ou adicione manualmente.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                nome: "",
                cpfCnpj: "",
                qualificacao: "",
                dataEntrada: "",
                faixaEtaria: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Sócio
          </Button>
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
          {isEditing ? "Salvar Alterações" : "Cadastrar Empresa"}
        </Button>
      </div>
    </form>
  );
}
