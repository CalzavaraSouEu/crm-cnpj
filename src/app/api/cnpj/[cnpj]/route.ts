import { NextRequest } from "next/server";

// In-memory cache: CNPJ data is mostly static, cache for 1 hour
const cache = new Map<string, { data: EmpresaData; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface SocioData {
  nome: string;
  cpfCnpj: string | null;
  qualificacao: string | null;
  dataEntrada: string | null;
  faixaEtaria: string | null;
}

interface EmpresaData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  situacaoCadastral: string | null;
  dataAbertura: string | null;
  naturezaJuridica: string | null;
  capitalSocial: number | null;
  porte: string | null;
  cnaePrincipal: string | null;
  cnaeDescricao: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  email: string | null;
  telefone: string | null;
  socios: SocioData[];
}

async function fetchBrasilAPI(cnpj: string): Promise<EmpresaData> {
  const res = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`BrasilAPI: ${res.status}`);
  const data = await res.json();

  const socios: SocioData[] = Array.isArray(data.qsa)
    ? data.qsa.map((s: Record<string, unknown>) => ({
        nome: String(s.nome_socio || ""),
        cpfCnpj: (s.cnpj_cpf_do_socio as string) || null,
        qualificacao: (s.qualificacao_socio as string) || null,
        dataEntrada: (s.data_entrada_sociedade as string) || null,
        faixaEtaria: (s.faixa_etaria as string) || null,
      }))
    : [];

  return {
    cnpj: data.cnpj,
    razaoSocial: data.razao_social,
    nomeFantasia: data.nome_fantasia || null,
    situacaoCadastral: data.descricao_situacao_cadastral || null,
    dataAbertura: data.data_inicio_atividade || null,
    naturezaJuridica: data.natureza_juridica || null,
    capitalSocial: data.capital_social ?? null,
    porte: data.porte || null,
    cnaePrincipal: data.cnae_fiscal?.toString() || null,
    cnaeDescricao: data.cnae_fiscal_descricao || null,
    logradouro: data.logradouro || null,
    numero: data.numero || null,
    complemento: data.complemento || null,
    bairro: data.bairro || null,
    municipio: data.municipio || null,
    uf: data.uf || null,
    cep: data.cep || null,
    email: data.email || null,
    telefone: data.ddd_telefone_1
      ? `(${data.ddd_telefone_1.slice(0, 2)}) ${data.ddd_telefone_1.slice(2)}`
      : null,
    socios,
  };
}

async function fetchOpenCNPJ(cnpj: string): Promise<EmpresaData> {
  const res = await fetch(
    `https://publica.cnpj.ws/cnpj/${cnpj}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error(`OpenCNPJ: ${res.status}`);
  const data = await res.json();

  const estabelecimento = data.estabelecimento || {};
  const cnaePrincipal = estabelecimento.atividade_principal || {};

  const socios: SocioData[] = Array.isArray(data.socios)
    ? data.socios.map((s: Record<string, unknown>) => ({
        nome: String(s.nome || ""),
        cpfCnpj: (s.cpf_cnpj as string) || null,
        qualificacao:
          typeof s.qualificacao === "object" && s.qualificacao !== null
            ? String((s.qualificacao as Record<string, unknown>).descricao || "")
            : (s.qualificacao as string) || null,
        dataEntrada: (s.data_entrada as string) || null,
        faixaEtaria: null,
      }))
    : [];

  return {
    cnpj: estabelecimento.cnpj || cnpj,
    razaoSocial: data.razao_social,
    nomeFantasia: estabelecimento.nome_fantasia || null,
    situacaoCadastral: estabelecimento.situacao_cadastral || null,
    dataAbertura: estabelecimento.data_inicio_atividade || null,
    naturezaJuridica: data.natureza_juridica?.descricao || null,
    capitalSocial: data.capital_social ? parseFloat(data.capital_social) : null,
    porte: data.porte?.descricao || null,
    cnaePrincipal: cnaePrincipal.id || null,
    cnaeDescricao: cnaePrincipal.descricao || null,
    logradouro: estabelecimento.logradouro || null,
    numero: estabelecimento.numero || null,
    complemento: estabelecimento.complemento || null,
    bairro: estabelecimento.bairro || null,
    municipio: estabelecimento.cidade?.nome || null,
    uf: estabelecimento.estado?.sigla || null,
    cep: estabelecimento.cep || null,
    email: estabelecimento.email || null,
    telefone: estabelecimento.ddd1 && estabelecimento.telefone1
      ? `(${estabelecimento.ddd1}) ${estabelecimento.telefone1}`
      : null,
    socios,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj } = await params;
  const cleanCnpj = cnpj.replace(/\D/g, "");

  if (cleanCnpj.length !== 14) {
    return Response.json(
      { error: "CNPJ deve ter 14 dígitos" },
      { status: 400 }
    );
  }

  // Check cache first
  const cached = cache.get(cleanCnpj);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json(cached.data, {
      headers: { "X-Cache": "HIT" },
    });
  }

  try {
    const data = await fetchBrasilAPI(cleanCnpj);
    cache.set(cleanCnpj, { data, timestamp: Date.now() });
    return Response.json(data, {
      headers: { "X-Cache": "MISS", "Cache-Control": "public, max-age=3600" },
    });
  } catch (brasilApiError) {
    console.warn(`BrasilAPI falhou para ${cleanCnpj}:`, brasilApiError);
    try {
      const data = await fetchOpenCNPJ(cleanCnpj);
      cache.set(cleanCnpj, { data, timestamp: Date.now() });
      return Response.json(data, {
        headers: {
          "X-Cache": "MISS",
          "X-Source": "fallback",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (fallbackError) {
      console.warn(`Fallback também falhou para ${cleanCnpj}:`, fallbackError);
      return Response.json(
        { error: "CNPJ não encontrado nas bases de dados" },
        { status: 404 }
      );
    }
  }
}
