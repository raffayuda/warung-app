'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [barangs, setBarangs] = useState([]);
  const [allBarangs, setAllBarangs] = useState([]); // Untuk menyimpan semua data
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nama: '',
    deskripsi: '',
    harga: '',
    stok: '',
  });

  // Fungsi untuk mengambil semua data
  const fetchAllData = async () => {
    try {
      let allData = [];
      let currentPage = 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const res = await fetch(`/api/barang?page=${currentPage}`);
        const data = await res.json();
        
        if (data.items && data.items.length > 0) {
          allData = [...allData, ...data.items];
          currentPage++;
        } else {
          hasMoreData = false;
        }
      }

      setAllBarangs(allData);
    } catch (error) {
      console.error('Error fetching all data:', error);
    }
  };

  // Fungsi untuk mengambil data per halaman
  const fetchPageData = async (pageNumber) => {
    try {
      const res = await fetch(`/api/barang?page=${pageNumber}`);
      const data = await res.json();
      setBarangs(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
  };

  useEffect(() => {
    // Ambil semua data untuk pencarian
    fetchAllData();
    // Ambil data untuk halaman pertama
    fetchPageData(page);
  }, []);

  useEffect(() => {
    if (!isSearching) {
      fetchPageData(page);
    }
  }, [page, isSearching]);

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    if (searchValue) {
      setIsSearching(true);
      const filteredData = allBarangs.filter(barang => 
        barang.nama.toLowerCase().includes(searchValue.toLowerCase()) ||
        barang.deskripsi.toLowerCase().includes(searchValue.toLowerCase())
      );
      setBarangs(filteredData);
    } else {
      setIsSearching(false);
      fetchPageData(page);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
      try {
        const response = await fetch(`/api/barang/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Gagal menghapus data');
        
        // Refresh kedua data
        fetchAllData();
        fetchPageData(page);
      } catch (error) {
        alert('Terjadi kesalahan: ' + error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/barang/${formData.id}` : '/api/barang';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          harga: parseFloat(formData.harga),
          stok: parseInt(formData.stok),
        }),
      });

      if (!response.ok) throw new Error('Gagal menyimpan data');
      
      setModalOpen(false);
      // Refresh kedua data
      fetchAllData();
      fetchPageData(page);
      resetForm();
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  const openModal = (barang = {}) => {
    setFormData({
      id: barang.id || null,
      nama: barang.nama || '',
      deskripsi: barang.deskripsi || '',
      harga: barang.harga || '',
      stok: barang.stok || '',
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ id: null, nama: '', deskripsi: '', harga: '', stok: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Barang di Warung</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Barang
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari barang..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nama</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Deskripsi</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Harga</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stok</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {barangs.map((barang) => (
                <tr key={barang.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{barang.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{barang.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{barang.deskripsi}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">Rp{barang.harga.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{barang.stok}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(barang)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(barang.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isSearching && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {formData.id ? 'Edit Barang' : 'Tambah Barang'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  required
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga
                </label>
                <input
                  type="number"
                  required
                  value={formData.harga}
                  onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok
                  </label>
                <input
                  type="number"
                  required
                  value={formData.stok}
                  onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}