import prisma from "../../../lib/prisma";

export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page')) || 1;
      const pageSize = 5; // Jumlah data per halaman
  
      const totalCount = await prisma.barang.count();
      const barangs = await prisma.barang.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
  
      return Response.json({
        items: barangs,
        totalPages: Math.ceil(totalCount / pageSize),
      });
    } catch (error) {
      return Response.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
  }
  

export async function POST(req) {
  try {
    const { nama, deskripsi, harga, stok } = await req.json();
    const barang = await prisma.barang.create({
      data: { nama, deskripsi, harga: parseInt(harga), stok: parseInt(stok) },
    });
    return Response.json(barang, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create item' }, { status: 500 });
  }
}