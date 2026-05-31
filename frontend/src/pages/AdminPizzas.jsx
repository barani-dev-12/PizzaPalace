import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { pizzaApi } from '../api/pizzaApi';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import { getPizzaImageUrl } from '../utils/pizzaImage';

const AdminPizzas = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null if creating, ID if editing
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Veg',
    isAvailable: true,
    sizes: ['Small', 'Medium', 'Large'],
    prices: {
      Small: 199,
      Medium: 349,
      Large: 499,
      'Extra Large': 649,
    },
  });

  const fetchPizzas = async () => {
    setLoading(true);
    try {
      const response = await pizzaApi.getAll({
        page,
        limit: 8,
        search: search.trim(),
      });
      if (response.data && response.data.success) {
        setPizzas(response.data.data.pizzas);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching pizzas:', error);
      toast.error('Failed to retrieve pizzas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  const handleToggleAvailable = async (pizza) => {
    try {
      const updatedValue = !pizza.isAvailable;
      const response = await pizzaApi.update(pizza._id, { isAvailable: updatedValue });
      if (response.data && response.data.success) {
        toast.success(`"${pizza.name}" is now ${updatedValue ? 'Available' : 'Unavailable'}`);
        setPizzas(
          pizzas.map((p) => (p._id === pizza._id ? { ...p, isAvailable: updatedValue } : p))
        );
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await pizzaApi.delete(id);
      if (response.data && response.data.success) {
        toast.success(`Pizza "${name}" deleted`);
        fetchPizzas();
      }
    } catch (error) {
      console.error('Error deleting pizza:', error);
      toast.error(error.response?.data?.message || 'Failed to delete pizza');
    }
  };

  const resetImageState = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
  };

  const closeModal = () => {
    resetImageState();
    setShowModal(false);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    resetImageState();
    setFormData({
      name: '',
      description: '',
      category: 'Veg',
      isAvailable: true,
      sizes: ['Small', 'Medium', 'Large'],
      prices: {
        Small: 199,
        Medium: 349,
        Large: 499,
        'Extra Large': 649,
      },
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (pizza) => {
    setEditingId(pizza._id);
    setImageFile(null);
    setImagePreview(getPizzaImageUrl(pizza.image, pizza.category));
    const rawPrices = pizza.prices;
    const mappedPrices = {
      Small: 199,
      Medium: 349,
      Large: 499,
      'Extra Large': 649,
    };

    if (rawPrices) {
      if (rawPrices instanceof Map) {
        rawPrices.forEach((val, key) => {
          mappedPrices[key] = val;
        });
      } else {
        Object.keys(rawPrices).forEach((key) => {
          mappedPrices[key] = rawPrices[key];
        });
      }
    }

    setFormData({
      name: pizza.name || '',
      description: pizza.description || '',
      category: pizza.category || 'Veg',
      isAvailable: pizza.isAvailable ?? true,
      sizes: pizza.sizes || ['Small', 'Medium', 'Large'],
      prices: mappedPrices,
    });
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePriceChange = (size, value) => {
    setFormData({
      ...formData,
      prices: {
        ...formData.prices,
        [size]: parseInt(value) || 0,
      },
    });
  };

  const handleSizeToggle = (size) => {
    const activeSizes = [...formData.sizes];
    if (activeSizes.includes(size)) {
      if (activeSizes.length === 1) {
        toast.error('At least one size must be selected');
        return;
      }
      setFormData({
        ...formData,
        sizes: activeSizes.filter((s) => s !== size),
      });
    } else {
      setFormData({
        ...formData,
        sizes: [...activeSizes, size],
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Verify prices exist for selected sizes
    const pricesPayload = {};
    formData.sizes.forEach((sz) => {
      pricesPayload[sz] = formData.prices[sz] || 199;
    });

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    payload.append('category', formData.category);
    payload.append('isAvailable', String(formData.isAvailable));
    payload.append('sizes', JSON.stringify(formData.sizes));
    payload.append('prices', JSON.stringify(pricesPayload));
    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      let response;
      if (editingId) {
        response = await pizzaApi.update(editingId, payload);
      } else {
        response = await pizzaApi.create(payload);
      }

      if (response.data && response.data.success) {
        toast.success(editingId ? 'Pizza updated successfully' : 'Pizza created successfully');
        closeModal();
        fetchPizzas();
      }
    } catch (error) {
      console.error('Error submitting pizza form:', error);
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Manage Pizza Catalogue</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Create, update, and manage the availability of your pizzas.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full shadow-sm hover:shadow text-sm transition-all"
        >
          Add New Pizza
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search pizza by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-5 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-xs transition-all"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.608 10.608Z" />
          </svg>
        </div>
      </div>

      {/* Pizzas List Table */}
      {loading ? (
        <div className="py-20">
          <Spinner />
        </div>
      ) : pizzas.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="py-4 px-6">Pizza Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Sizes Available</th>
                  <th className="py-4 px-6">Availability</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {pizzas.map((pizza) => (
                  <tr key={pizza._id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={getPizzaImageUrl(pizza.image, pizza.category)}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80';
                          }}
                          alt={pizza.name}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-50 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{pizza.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium line-clamp-1 truncate max-w-xs sm:max-w-md">
                            {pizza.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700">
                        {pizza.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1.5 flex-wrap">
                        {pizza.sizes.map((sz) => (
                          <span key={sz} className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                            {sz}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 select-none">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pizza.isAvailable}
                          onChange={() => handleToggleAvailable(pizza)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="ms-2.5 text-[10px] font-bold text-gray-500">
                          {pizza.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </label>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(pizza)}
                          className="p-2 hover:bg-amber-50 hover:text-amber-600 text-gray-400 rounded-xl transition-colors"
                          aria-label="Edit pizza"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(pizza._id, pizza.name)}
                          className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-xl transition-colors"
                          aria-label="Delete pizza"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 py-4 border-t border-gray-100 select-none">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border rounded-lg text-xs font-bold hover:bg-amber-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-bold self-center text-gray-500">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border rounded-lg text-xs font-bold hover:bg-amber-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border rounded-3xl p-8 shadow-sm">
          No pizzas found in the catalogue. Add one above!
        </div>
      )}

      {/* Add / Edit Pizza Modal Overlay */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              aria-label="Close modal"
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] border-0 cursor-default"
              onClick={closeModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pizza-modal-title"
              className="relative bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <h2 id="pizza-modal-title" className="text-lg font-bold text-gray-800">
                  {editingId ? 'Edit Pizza Selection' : 'Create New Pizza'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pizza Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-xs transition-all"
                  placeholder="e.g. Pepperoni Feast"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-xs transition-all"
                  placeholder="Tell us about the ingredients and flavor..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-bold text-xs bg-white cursor-pointer"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Premium">Premium</option>
                    <option value="Classic">Classic</option>
                    <option value="Specialty">Specialty</option>
                  </select>
                </div>

                <div className="space-y-1 select-none flex flex-col justify-end pb-1.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleFormChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ms-2 text-xs font-bold text-gray-700">Available In Stock</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pizza Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Pizza preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      className="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                    />
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Upload JPG, PNG, WEBP, or GIF. Max 5MB. This image appears on the menu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sizes Selector */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Sizes & Pricing</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Small', 'Medium', 'Large', 'Extra Large'].map((sz) => {
                    const isActive = formData.sizes.includes(sz);
                    return (
                      <div
                        key={sz}
                        className={`border p-3 rounded-2xl flex flex-col gap-2 transition-all ${
                          isActive
                            ? 'border-amber-500 bg-amber-50/20'
                            : 'border-gray-150 bg-gray-50/50'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => handleSizeToggle(sz)}
                            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 h-3.5 w-3.5"
                          />
                          <span className="text-xs font-bold text-gray-700">{sz}</span>
                        </label>
                        {isActive && (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              required
                              value={formData.prices[sz]}
                              onChange={(e) => handlePriceChange(sz, e.target.value)}
                              className="w-full pl-6 pr-3 py-1.5 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-semibold text-gray-700"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-100 pt-5 flex justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-full hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full shadow-sm transition-all"
                >
                  {editingId ? 'Save Changes' : 'Create Pizza'}
                </button>
              </div>
            </form>
          </div>
        </div>,
          document.body
        )}
    </div>
  );
};

export default AdminPizzas;