import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function replacer(key: string, value: unknown) {
  if (typeof value === 'bigint') return value.toString();
  return value;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const skip = (page - 1) * pageSize;

  const search = searchParams.get('search');
  
  const conditions: Prisma.UsuarioWhereInput[] = [];

  if (search) {
     conditions.push({
       OR: [
        { Nombre: { contains: search } },
        { Apellidos: { contains: search } },
        { Usuario: { contains: search } },
        { Email: { contains: search } },
       ]
     });
  }

  const where: Prisma.UsuarioWhereInput = { AND: conditions };

  try {
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        take: pageSize,
        skip: skip,
        orderBy: { Id_Usuario: 'asc' }
      }),
      prisma.usuario.count({ where })
    ]);

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(usuarios, replacer)),
      total
    });
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json({ error: 'Error fetching usuarios' }, { status: 500 });
  }
}
