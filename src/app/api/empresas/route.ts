import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { empresaApiSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const search = searchParams.get("search") || "";

  const where = search
    ? {
        OR: [
          { razaoSocial: { contains: search } },
          { cnpj: { contains: search } },
          { nomeFantasia: { contains: search } },
          { municipio: { contains: search } },
        ],
      }
    : {};

  const [empresas, total] = await Promise.all([
    prisma.empresa.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.empresa.count({ where }),
  ]);

  return Response.json({
    data: empresas,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
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

  const cleanCnpj = parsed.data.cnpj.replace(/\D/g, "");

  const existing = await prisma.empresa.findUnique({
    where: { cnpj: cleanCnpj },
  });

  if (existing) {
    return Response.json(
      { error: "Empresa com este CNPJ já está cadastrada" },
      { status: 409 }
    );
  }

  const empresa = await prisma.empresa.create({
    data: {
      ...parsed.data,
      cnpj: cleanCnpj,
    },
  });

  revalidatePath("/empresas");

  return Response.json(empresa, { status: 201 });
}
