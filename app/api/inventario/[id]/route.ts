import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const decodedId = decodeURIComponent(id);

    // 1. Fetch Producto
    const producto = await prisma.producto.findUnique({
      where: { Id_Producto: decodedId }
    });

    if (!producto) {
      return NextResponse.json({ error: 'Producto not found' }, { status: 404 });
    }

    // 2. Fetch Relations
    const [empresa, sucursal, familia, usuarioCreacion, usuarioActualizacion] = await Promise.all([
      prisma.empresa.findUnique({ where: { Id_Empresa: producto.Id_Empresa } }),
      prisma.sucursal.findUnique({ where: { Id_Sucursal: producto.Id_Sucursal } }),
      prisma.familia.findUnique({ where: { Id_Familia: producto.Id_Familia } }),
      producto.swcreatedby ? prisma.usuario.findUnique({ where: { Id_Usuario: producto.swcreatedby } }) : Promise.resolve(null),
      producto.swupdatedby ? prisma.usuario.findUnique({ where: { Id_Usuario: producto.swupdatedby } }) : Promise.resolve(null)
    ]);

    // 3. Construct Response with Enriched Data
    const responseData = {
      ...producto,
      Entidades: {
        Empresa: empresa ? empresa.Descripcion : producto.Id_Empresa,
        Sucursal: sucursal ? sucursal.NombreSucursal : producto.Id_Sucursal,
        Familia: familia ? familia.Descripcion : producto.Id_Familia,
        UsuarioCreacion: usuarioCreacion ? (usuarioCreacion.Nombre || usuarioCreacion.Usuario) : producto.swcreatedby,
        UsuarioActualizacion: usuarioActualizacion ? (usuarioActualizacion.Nombre || usuarioActualizacion.Usuario) : producto.swupdatedby,
      }
    };

    return new NextResponse(JSON.stringify(responseData, replacer), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching producto detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
