import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../utils/cn';
import { Plus, Search, Filter, Pencil, Trash2, Image, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductEditModal from './ProductEditModal';

const ProductList = () => {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: productsResponse, isLoading, refetch } = useQuery({ 
    queryKey: ['products'], 
    queryFn: api.getProducts 
  });

  const products = productsResponse?.products || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Product deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete product');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    }
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    refetch();
    toast.success('Product updated successfully');
  };

  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.subCategory?.toLowerCase().includes(search.toLowerCase())
  );

  // Get cover image (first image)
  const getCoverImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://via.placeholder.com/40';
  };

  // Mobile Product Card View
  const MobileProductCard = ({ product }: { product: Product }) => (
    <div className="bg-slate-800/50 rounded-lg p-4 mb-3 border border-slate-700">
      <div className="flex gap-3">
        <div className="relative flex-shrink-0">
          <img 
            src={getCoverImage(product)} 
            alt={product.name} 
            className="h-16 w-16 rounded object-cover bg-slate-700 border border-slate-600"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/64';
            }}
          />
          {product.images && product.images.length > 1 && (
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center border border-slate-900">
              +{product.images.length - 1}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-white text-sm truncate">{product.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{product.subCategory}</p>
            </div>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap",
              product.inStock 
                ? "bg-green-500/10 text-green-400 border-green-500/20" 
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                <span className="text-white font-medium">{formatCurrency(product.price)}</span>
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Image size={12} />
                {product.images?.length || 0}
              </span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => handleEditClick(product)}
                className="p-1.5 bg-slate-700 rounded text-slate-300 hover:text-indigo-400 transition-colors"
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button 
                onClick={() => handleDelete(product._id)}
                className="p-1.5 bg-slate-700 rounded text-slate-300 hover:text-red-400 transition-colors"
                disabled={deleteMutation.isPending}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Products</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">
            Manage your inventory and product listings.
          </p>
          {products.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Total: {products.length} products
            </p>
          )}
        </div>
        <Link to="/products/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-2.5">
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" /> 
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-0 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-700/50 bg-surface">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search - Always visible */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-slate-700 text-sm rounded-md pl-10 pr-4 py-2.5 sm:py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            {/* Filter Button - Mobile */}
            <button 
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="sm:hidden flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-4 py-2.5 text-slate-300"
            >
              <Filter size={16} />
              <span>Filters</span>
              {isMobileFiltersOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            {/* Filters - Desktop */}
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter size={16} /> Filters
              </Button>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {isMobileFiltersOpen && (
            <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700 sm:hidden">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white">
                    <option>All Categories</option>
                    <option>Men</option>
                    <option>Women</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Stock Status</label>
                  <select className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white">
                    <option>All</option>
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-300">
              <tr>
                <th className="px-4 lg:px-6 py-4">Product</th>
                <th className="px-4 lg:px-6 py-4">Category</th>
                <th className="px-4 lg:px-6 py-4">Price</th>
                <th className="px-4 lg:px-6 py-4">Stock</th>
                <th className="px-4 lg:px-6 py-4">Images</th>
                <th className="px-4 lg:px-6 py-4">Status</th>
                <th className="px-4 lg:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="text-center py-4">
                      <p className="text-slate-400 mb-2">
                        {search ? 'No products match your search' : 'No products found'}
                      </p>
                      {search && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSearch('')}
                          className="mt-2"
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={getCoverImage(product)} 
                            alt={product.name} 
                            className="h-10 w-10 lg:h-12 lg:w-12 rounded object-cover bg-slate-700 border border-slate-600"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/40';
                            }}
                          />
                          {product.images && product.images.length > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full w-4 h-4 lg:w-5 lg:h-5 text-[10px] lg:text-xs flex items-center justify-center border border-slate-900">
                              +{product.images.length - 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-white text-sm lg:text-base block">{product.name}</span>
                          {product.subCategory && (
                            <span className="text-[10px] lg:text-xs text-slate-500">{product.subCategory}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] lg:text-xs bg-slate-800 text-slate-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-white font-medium text-sm lg:text-base">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm">
                      {product.stockQuantity || product.stock || 0}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Image size={14} className="text-slate-500" />
                        <span className="text-sm">{product.images?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] lg:text-xs font-medium border whitespace-nowrap",
                        product.inStock 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 lg:gap-2">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-1.5 lg:p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} className="lg:w-4 lg:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 lg:p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                          disabled={deleteMutation.isPending}
                          title="Delete"
                        >
                          <Trash2 size={14} className="lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="block md:hidden p-3 sm:p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
              <span className="text-slate-400">Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 mb-2">
                {search ? 'No products match your search' : 'No products found'}
              </p>
              {search && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearch('')}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <MobileProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <ProductEditModal
          product={editingProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default ProductList;