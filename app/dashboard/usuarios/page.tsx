import { DataTable } from '@/components/ui/DataTable';
import { UsuarioFilters } from '@/components/usuarios/UsuarioFilters';
import { fetchFromApi } from '@/lib/api';

interface UsuarioRow {
  Id_Usuario: number | string;
  Nombre: string | null;
  Apellidos: string | null;
  Usuario: string | null;
  Email: string | null;
}

interface RawUsuario {
  Id_Usuario: number | string;
  Nombre: string | null;
  Apellidos: string | null;
  Usuario: string | null;
  Email: string | null;
  [key: string]: unknown;
}

async function getUsuarios(searchParams: { [key: string]: string | string[] | undefined }) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;

  const filters: Record<string, string> = {};
  if (typeof searchParams.search === 'string') filters.search = searchParams.search;

  const { data, total } = await fetchFromApi('usuarios', page, pageSize, filters);

  const formattedData: UsuarioRow[] = (data as RawUsuario[]).map(m => ({
    Id_Usuario: m.Id_Usuario,
    Nombre: m.Nombre,
    Apellidos: m.Apellidos,
    Usuario: m.Usuario || m.Email || '-', // Fallback to Email if Usuario is empty
    Email: m.Email,
  }));

  return { data: formattedData, total };
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;
  
  const { data, total } = await getUsuarios(resolvedSearchParams);
  const totalPages = Math.ceil(total / pageSize);

  const columns: {
    header: string;
    accessorKey: keyof UsuarioRow;
    className?: string;
  }[] = [
    { header: 'ID', accessorKey: 'Id_Usuario', className: 'w-20' },
    { header: 'Usuario', accessorKey: 'Usuario', className: 'font-medium text-gray-900' },
    { header: 'Nombre', accessorKey: 'Nombre' },
    { header: 'Apellidos', accessorKey: 'Apellidos' },
    { header: 'Email', accessorKey: 'Email' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        </div>
      </div>

      <UsuarioFilters />

      <DataTable 
        columns={columns} 
        data={data} 
        title="Listado de Usuarios"
        currentPage={page}
        totalPages={totalPages}
        baseUrl="/dashboard/usuarios"
      />
    </div>
  );
}