import Link from "next/link";
import { EmpresasTable } from "@/components/empresas-table";
import { Button } from "@/components/ui/button";

export default function EmpresasPage() {
  return (
    <div className="mx-auto py-8 px-4 w-[80%]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as empresas cadastradas no CRM
          </p>
        </div>
        <Link href="/empresas/nova">
          <Button>+ Nova Empresa</Button>
        </Link>
      </div>
      <EmpresasTable />
    </div>
  );
}
