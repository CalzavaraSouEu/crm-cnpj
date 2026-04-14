import { EmpresaForm } from "@/components/empresa-form";

export default function NovaEmpresaPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Nova Empresa</h1>
        <p className="text-muted-foreground mt-1">
          Cadastre uma nova empresa inserindo o CNPJ
        </p>
      </div>
      <EmpresaForm />
    </div>
  );
}
