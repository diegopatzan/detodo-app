import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;

  try {
    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        take: pageSize,
        skip: skip,
        orderBy: { Id_Empresa: 'asc' }
      }),
      prisma.empresa.count()
    ]);

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(empresas, replacer)),
      total
    });
  } catch (error) {
    console.error('Error fetching empresas:', error);
    return NextResponse.json({ error: 'Error fetching empresas' }, { status: 500 });
  }
}
