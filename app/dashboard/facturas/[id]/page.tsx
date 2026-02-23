
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { Prisma, FacturaDetalle } from '@prisma/client';

// Helper to handle BigInt serialization
function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

interface ApiFacturaDetalle {
  Id_FacturaTemporal: string;
  Id_Producto: string;
  NombreProducto?: string | null;
  Descripcion: string | null;
  Cantidad: number;
  Precio_Unitario: string | number;
  Total_Venta: string | number;
  Total_Descuento: string | number;
  PorcentajeDescuento: string | number;
  PorcentajeDescuentoEsperado: string | number;
  Total_IVA: string | number;
  Total_SubTotal: string | number;
  Id_ProductoFactura: string | null;
  swdatecreated: string | null;
  swdateupdated: string | null;
  swcreatedby: string | null;
  swupdatedby: string | null;
  [key: string]: unknown;
}

interface ApiFactura {
  Id_FacturaTemporal: string;
  Nombre: string | null;
  No_NIT: string | null;
  Direccion: string | null;
  NumeroTelefono: string | null;
  CorreoElectronico: string | null;
  CodigoClienteMembresia: string | null;
  Numero_Autorizacion: string | null;
  Factura_Serie: string | null;
  Factura_Numero: string | null;
  fechaCertificacion: string | null;
  fechaAnulacion: string | null;
  CertificacionRealizada: boolean | null;
  
  Total_SubTotal: string | number;
  Total_Descuento: string | number;
  Total_IVA: string | number;
  Total_Venta: string | number;
  
  Total_Efectivo: string | number;
  Total_TarjetaCredito: string | number;
  Total_Transferencia: string | number;
  Total_Credito: string | number;
  Total_NotaDeCredito: string | number;
  
  Id_Empresa: number;
  Id_Sucursal: number;
  Id_Bodega: number;
  NumeroDeCaja: string | null;
  
  swdatecreated: string | null;
  swcreatedby: string | null;
  swdateupdated: string | null;
  swupdatedby: string | null;
  Id_Cotizacion: string;
  CantidadProductos: number | null;
  Observaciones: string | null;

  detalles: ApiFacturaDetalle[];
  Entidades: {
    Empresa: string | number;
    Sucursal: string | number;
    Bodega: string | number;
  };
}

async function getFactura(id: string) {
  try {
    const facturaId = BigInt(id);

    // 1. Fetch Factura
    const factura = await prisma.factura.findUnique({
      where: { Id_FacturaTemporal: facturaId }
    });

    if (!factura) {
      return null;
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
    const productIds = Array.from(new Set(detalles.map((d: FacturaDetalle) => d.Id_Producto)));
    const productos = await prisma.producto.findMany({
      where: { Id_Producto: { in: productIds } },
      select: { Id_Producto: true, Nombre: true }
    });

    // Explicitly typing 'p' to avoid TS implicit any error
    const productoMap = new Map(productos.map((p: { Id_Producto: string; Nombre: string | null }) => [p.Id_Producto, p.Nombre]));

    // 5. Construct Response with Enriched Data
    const enrichedDetalles = detalles.map((d: FacturaDetalle) => ({
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

    // Serialize to handle BigInt and match expected structure
    const raw = JSON.parse(JSON.stringify(responseData, replacer)) as ApiFactura;

    return {
      ...raw,
      Total_Venta: Number(raw.Total_Venta),
      Total_Descuento: Number(raw.Total_Descuento),
      Total_IVA: Number(raw.Total_IVA),
      Total_SubTotal: Number(raw.Total_SubTotal),
      Total_Efectivo: Number(raw.Total_Efectivo),
      Total_TarjetaCredito: Number(raw.Total_TarjetaCredito),
      Total_Transferencia: Number(raw.Total_Transferencia),
      Total_Credito: Number(raw.Total_Credito),
      Total_NotaDeCredito: Number(raw.Total_NotaDeCredito),

      swdatecreated: raw.swdatecreated ? new Date(raw.swdatecreated).toLocaleDateString() : '-',
      swdateupdated: raw.swdateupdated ? new Date(raw.swdateupdated).toLocaleDateString() : '-',
      fechaCertificacion: raw.fechaCertificacion ? new Date(raw.fechaCertificacion).toLocaleDateString() : '-',
      fechaAnulacion: raw.fechaAnulacion ? new Date(raw.fechaAnulacion).toLocaleDateString() : '-',
      
      detalles: raw.detalles.map(d => ({
        ...d,
        Precio_Unitario: Number(d.Precio_Unitario),
        Total_Venta: Number(d.Total_Venta),
        Total_SubTotal: Number(d.Total_SubTotal),
        Total_Descuento: Number(d.Total_Descuento),
        PorcentajeDescuento: Number(d.PorcentajeDescuento),
        Total_IVA: Number(d.Total_IVA),
        Descripcion: d.NombreProducto || d.Descripcion, 
      }))
    };
  } catch (error) {
    console.error("Error fetching factura:", error);
    return null;
  }
}

// Helper to style section headers consistently
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="text-[#714B67] uppercase text-xs font-bold tracking-wider border-b border-gray-100 pb-2 mb-4 mt-6 first:mt-0">
      {title}
    </h3>
  );
}

function DetailRow({ label, value, className = "" }: { label: string, value: React.ReactNode, className?: string }) {
  return (
    <div className={`py-2 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-50 last:border-0 ${className}`}>
      <dt className="text-sm font-semibold text-gray-600">{label}</dt>
      <dd className="text-sm text-gray-900 sm:col-span-2 mt-1 sm:mt-0">{value ?? '-'}</dd>
    </div>
  );
}

function PaymentRow({ label, amount }: { label: string, amount: number }) {
  if (amount === 0) return null;
  return (
    <div className="flex justify-between py-1 text-sm border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
    </div>
  );
}

export default async function FacturaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factura = await getFactura(id);

  if (!factura) {
    notFound();
  }

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Header / Breadcrumb Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Link 
            href="/dashboard/facturas" 
            className="p-2 -ml-2 text-gray-500 hover:text-[#714B67] hover:bg-white rounded-md transition-colors"
            >
            <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">Facturación</span>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#714B67]">
                       Factura <span className="text-gray-900">{factura.Factura_Serie}-{factura.Factura_Numero}</span>
                    </h1>
                     <span className={`px-2 py-0.5 rounded text-xs font-medium border ${factura.CertificacionRealizada ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                         {factura.CertificacionRealizada ? 'Certificada' : 'Borrador'} 
                    </span>
                </div>
            </div>
        </div>
         {/* <div className="flex gap-3">
             <button className="px-4 py-2 bg-[#714B67] text-white text-sm font-medium rounded hover:bg-[#5d3d54] transition-colors shadow-sm">
                Imprimir Factura
             </button>
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50 transition-colors shadow-sm">
                Enviar por Correo
             </button>
        </div> */}
      </div>

     <div className="flex gap-6 flex-col xl:flex-row">
        {/* Main Sheet (Left Content) */}
        <div className="flex-1 bg-white shadow-sm border border-gray-200 rounded-sm p-6 md:p-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
                 <div>
                    <SectionHeader title="Cliente" />
                    <div className="text-lg font-bold text-gray-900 mb-2">{factura.Nombre}</div>
                    <dl className="space-y-1">
                        <DetailRow label="NIT" value={factura.No_NIT} />
                        <DetailRow label="Dirección" value={factura.Direccion} />
                        <DetailRow label="Teléfono" value={factura.NumeroTelefono} />
                        <DetailRow label="Email" value={factura.CorreoElectronico} />
                        <DetailRow label="Código" value={factura.CodigoClienteMembresia} />
                    </dl>
                 </div>
                 <div>
                    <SectionHeader title="Datos Fiscales" />
                    <dl className="space-y-1">
                         <DetailRow label="Autorización" value={<span className="font-mono text-xs">{factura.Numero_Autorizacion}</span>} />
                         <DetailRow label="Fecha" value={factura.fechaCertificacion} />
                         {factura.fechaAnulacion !== '-' && (
                            <DetailRow label="Anulado" value={<span className="text-red-600 font-bold">{factura.fechaAnulacion}</span>} />
                        )}
                        <DetailRow label="Caja" value={factura.NumeroDeCaja} />
                         <DetailRow label="Vendedor" value={factura.swcreatedby} />
                    </dl>
                 </div>
            </div>

            {/* Items Table */}
            <div className="mt-8">
                <h3 className="text-[#714B67] uppercase text-xs font-bold tracking-wider mb-4">Líneas de Factura</h3>
                <div className="border border-gray-200 rounded-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 border-b-2 border-[#714B67]/20">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left font-bold text-gray-700">Producto</th>
                                <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700">Cant.</th>
                                <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700">Precio</th>
                                <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700">Desc.</th>
                                <th scope="col" className="px-4 py-3 text-right font-bold text-gray-700">Subtotal</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-100">
                             {factura.detalles.length > 0 ? (
                                factura.detalles.map((detalle, index) => (
                                    <tr key={index} className="hover:bg-[#714B67]/5 transition-colors">
                                        <td className="px-4 py-2">
                                            <div className="font-medium text-gray-900">{detalle.Descripcion || detalle.Id_Producto}</div>
                                            <div className="text-xs text-gray-500">{detalle.Id_Producto}</div>
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-900">{detalle.Cantidad}</td>
                                        <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(detalle.Precio_Unitario)}</td>
                                        <td className="px-4 py-2 text-right text-gray-500">
                                            {detalle.Total_Descuento > 0 ? `-${formatCurrency(detalle.Total_Descuento)}` : '-'}
                                        </td>
                                         <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(detalle.Total_Venta)}</td>
                                    </tr>
                                ))
                             ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">Sin productos</td>
                                </tr>
                             )}
                         </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    {factura.Observaciones && (
                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded text-sm text-yellow-800">
                             <strong>Notas:</strong> {factura.Observaciones}
                        </div>
                    )}
                 </div>
                 <div className="bg-gray-50 p-6 rounded border border-gray-200">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(factura.Total_SubTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Descuento</span>
                        <span className="text-gray-900 font-medium">-{formatCurrency(factura.Total_Descuento)}</span>
                        </div>
                         <div className="flex justify-between text-sm mb-4 pb-4 border-b border-gray-200">
                        <span className="text-gray-600">IVA (Incluido)</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(factura.Total_IVA)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#714B67]">Total a Pagar</span>
                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(factura.Total_Venta)}</span>
                        </div>
                 </div>
            </div>

        </div>

        {/* Right Sidebar (System Info & Payments) */}
         <div className="w-full xl:w-80 space-y-6">
             <div className="bg-white shadow-sm border border-gray-200 rounded-sm p-5">
                   <h3 className="text-gray-900 font-bold mb-4 border-b pb-2">Pagos Registrados</h3>
                   <div className="space-y-1">
                        <PaymentRow label="Efectivo" amount={factura.Total_Efectivo} />
                        <PaymentRow label="Tarjeta" amount={factura.Total_TarjetaCredito} />
                        <PaymentRow label="Transferencia" amount={factura.Total_Transferencia} />
                        <PaymentRow label="Crédito" amount={factura.Total_Credito} />
                        <PaymentRow label="Nota Cr." amount={factura.Total_NotaDeCredito} />
                        {factura.Total_Efectivo === 0 && 
                        factura.Total_TarjetaCredito === 0 && 
                        factura.Total_Transferencia === 0 && 
                        factura.Total_Credito === 0 && 
                        factura.Total_NotaDeCredito === 0 && (
                        <div className="text-sm text-gray-400 italic text-center py-2">Pendiente de Pago</div>
                        )}
                   </div>
             </div>

             <div className="bg-white shadow-sm border border-gray-200 rounded-sm p-5">
                  <h3 className="text-gray-900 font-bold mb-4 border-b pb-2">Información Interna</h3>
                   <dl className="space-y-3 text-xs">
                      <div>
                          <dt className="text-gray-500">ID Interno</dt>
                          <dd className="font-mono text-gray-700 truncate" title={factura.Id_FacturaTemporal}>{factura.Id_FacturaTemporal}</dd>
                      </div>
                      <div>
                          <dt className="text-gray-500">ID Cotización</dt>
                          <dd className="font-mono text-gray-700">{factura.Id_Cotizacion}</dd>
                      </div>
                      <div>
                          <dt className="text-gray-500">Sucursal</dt>
                          <dd className="text-gray-700">{factura.Entidades?.Sucursal || factura.Id_Sucursal}</dd>
                      </div>
                      <div>
                          <dt className="text-gray-500">Usuario Creador</dt>
                          <dd className="text-gray-700">{factura.swcreatedby}</dd>
                      </div>
                        <div>
                          <dt className="text-gray-500">Fecha Actualización</dt>
                          <dd className="text-gray-700">{factura.swdateupdated}</dd>
                      </div>
                   </dl>
             </div>
         </div>
     </div>
    </div>
  );
}