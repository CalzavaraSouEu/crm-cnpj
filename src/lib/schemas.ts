import { z } from "zod";
import { cleanCNPJ, validateCNPJ } from "./cnpj";

export const socioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpfCnpj: z.string().default(""),
  qualificacao: z.string().default(""),
  dataEntrada: z.string().default(""),
  faixaEtaria: z.string().default(""),
});

export type SocioFormData = z.infer<typeof socioSchema>;

export const socioApiSchema = z.object({
  nome: z.string().min(1),
  cpfCnpj: z.string().nullable().optional(),
  qualificacao: z.string().nullable().optional(),
  dataEntrada: z.string().nullable().optional(),
  faixaEtaria: z.string().nullable().optional(),
});

export type SocioApiData = z.infer<typeof socioApiSchema>;

export const empresaFormSchema = z.object({
  cnpj: z.string().refine((v) => validateCNPJ(cleanCNPJ(v)), {
    message: "CNPJ inválido",
  }),
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().default(""),
  situacaoCadastral: z.string().default(""),
  dataAbertura: z.string().default(""),
  naturezaJuridica: z.string().default(""),
  capitalSocial: z.string().default(""),
  porte: z.string().default(""),
  cnaePrincipal: z.string().default(""),
  cnaeDescricao: z.string().default(""),
  logradouro: z.string().default(""),
  numero: z.string().default(""),
  complemento: z.string().default(""),
  bairro: z.string().default(""),
  municipio: z.string().default(""),
  uf: z.string().default(""),
  cep: z.string().default(""),
  email: z.string().default(""),
  telefone: z.string().default(""),
  socios: z.array(socioSchema).default([]),
});

// Input type (what the form fields hold — optional fields can be undefined)
export type EmpresaFormInput = z.input<typeof empresaFormSchema>;
// Output type (after Zod applies defaults — all fields are strings)
export type EmpresaFormData = z.infer<typeof empresaFormSchema>;

export const empresaApiSchema = z.object({
  cnpj: z.string().min(14).max(18),
  razaoSocial: z.string().min(1, "Razão social é obrigatória"),
  nomeFantasia: z.string().nullable().optional(),
  situacaoCadastral: z.string().nullable().optional(),
  dataAbertura: z.string().nullable().optional(),
  naturezaJuridica: z.string().nullable().optional(),
  capitalSocial: z.number().nullable().optional(),
  porte: z.string().nullable().optional(),
  cnaePrincipal: z.string().nullable().optional(),
  cnaeDescricao: z.string().nullable().optional(),
  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  municipio: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  socios: z.array(socioApiSchema).default([]),
});

export type EmpresaApiData = z.infer<typeof empresaApiSchema>;

const FORM_FIELDS = [
  "razaoSocial",
  "nomeFantasia",
  "situacaoCadastral",
  "dataAbertura",
  "naturezaJuridica",
  "porte",
  "cnaePrincipal",
  "cnaeDescricao",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "municipio",
  "uf",
  "cep",
  "email",
  "telefone",
] as const;

export type FormFieldName = (typeof FORM_FIELDS)[number];
export { FORM_FIELDS };
