import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { empresaApiSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const empresaId = parseInt(id);
  if (isNaN(empresaId)) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    include: { socios: true },
  });

  if (!empresa) {
    return Response.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  return Response.json(empresa);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const empresaId = parseInt(id);
  if (isNaN(empresaId)) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Corpo da requisição inválido" },
      { status: 400 }
    );
  }

  const parsed = empresaApiSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.empresa.findUnique({
    where: { id: empresaId },
  });
  if (!existing) {
    return Response.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  const cleanCnpj = parsed.data.cnpj.replace(/\D/g, "");

  // Check if CNPJ is taken by another empresa
  const cnpjTaken = await prisma.empresa.findFirst({
    where: { cnpj: cleanCnpj, id: { not: empresaId } },
  });
  if (cnpjTaken) {
    return Response.json(
      { error: "Outro cadastro já usa este CNPJ" },
      { status: 409 }
    );
  }

  const { socios, ...empresaData } = parsed.data;

  const empresa = await prisma.$transaction(async (tx) => {
    // Delete existing socios and recreate
    await tx.socio.deleteMany({ where: { empresaId } });

    return tx.empresa.update({
      where: { id: empresaId },
      data: {
        ...empresaData,
        cnpj: cleanCnpj,
        socios:
          socios.length > 0
            ? {
                create: socios.map((s) => ({
                  nome: s.nome,
                  cpfCnpj: s.cpfCnpj || null,
                  qualificacao: s.qualificacao || null,
                  dataEntrada: s.dataEntrada || null,
                  faixaEtaria: s.faixaEtaria || null,
                })),
              }
            : undefined,
      },
      include: { socios: true },
    });
  });

  revalidatePath("/empresas");

  return Response.json(empresa);
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const empresaId = parseInt(id);
  if (isNaN(empresaId)) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const existing = await prisma.empresa.findUnique({
    where: { id: empresaId },
  });
  if (!existing) {
    return Response.json({ error: "Empresa não encontrada" }, { status: 404 });
  }

  await prisma.empresa.delete({ where: { id: empresaId } });

  revalidatePath("/empresas");

  return Response.json({ success: true });
}
