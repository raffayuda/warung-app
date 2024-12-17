import prisma from "../../../../lib/prisma";

export async function GET(_, { params }) {
  const { id } = params;
  try {
    const barang = await prisma.barang.findUnique({ where: { id: parseInt(id) } });
    if (!barang) return Response.json({ error: 'Item not found' }, { status: 404 });
    return Response.json(barang);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const { nama, deskripsi, harga, stok } = await req.json();
    const barang = await prisma.barang.update({
      where: { id: parseInt(id) },
      data: { nama, deskripsi, harga: parseInt(harga), stok: parseInt(stok) },
    });
    return Response.json(barang);
  } catch (error) {
    return Response.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  const { id } = params;
  try {
    await prisma.barang.delete({ where: { id: parseInt(id) } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}