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
    const facturaId = BigInt(id);

    // 1. Fetch Factura
    const factura = await prisma.factura.findUnique({
      where: { Id_FacturaTemporal: facturaId }
    });

    if (!factura) {
      return NextResponse.json({ error: 'Factura not found' }, { status: 404 });
    }

    // 2. Fetch Detalles
    const detalles = await prisma.facturaDetalle.findMany({
      where: { Id_FacturaTemporal: facturaId }
    });

    // 3. Fetch Relations
    const [empresa, sucursal] = await Promise.all([
      prisma.empresa.findUnique({ where: { Id_Empresa: factura.Id_Empresa } }),
      prisma.sucursal.findUnique({ where: { Id_Sucursal: factura.Id_Sucursal } })
    ]);

    // 4. Fetch Product Names for Details
    const productIds = Array.from(new Set(detalles.map(d => d.Id_Producto)));
    const productos = await prisma.producto.findMany({
      where: { Id_Producto: { in: productIds } },
      select: { Id_Producto: true, Nombre: true }
    });

    const productoMap = new Map(productos.map(p => [p.Id_Producto, p.Nombre]));

    // 5. Construct Response with Enriched Data
    const enrichedDetalles = detalles.map(d => ({
      ...d,
      NombreProducto: productoMap.get(d.Id_Producto) || d.Descripcion || d.Id_Producto
    }));

    const responseData = {
      ...factura,
      detalles: enrichedDetalles,
      Entidades: {
        Empresa: empresa ? empresa.Descripcion : factura.Id_Empresa,
        Sucursal: sucursal ? sucursal.NombreSucursal : factura.Id_Sucursal,
        // Bodega table not found in schema, returning ID
        Bodega: factura.Id_Bodega
      }
    };

    return new NextResponse(JSON.stringify(responseData, replacer), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching factura detail:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
