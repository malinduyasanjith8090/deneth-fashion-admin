import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../utils/cn';
import { Plus, Search, Filter, Pencil, Trash2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductEditModal from './ProductEditModal';

const ProductList = () => {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-slate-400">Manage your inventory and product listings.</p>
          {products.length > 0 && (
            <p className="text-sm text-slate-500 mt-1">
              Total: {products.length} products
            </p>
          )}
        </div>
        <Link to="/products/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add New Product
          </Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-slate-700 text-sm rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter size={16} /> Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-300">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Images</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            src={getCoverImage(product)} 
                            alt={product.name} 
                            className="h-12 w-12 rounded object-cover bg-slate-700 border border-slate-600"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48';
                              e.currentTarget.className = 'h-12 w-12 rounded bg-slate-700 border border-slate-600 flex items-center justify-center';
                            }}
                          />
                          {product.images && product.images.length > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center border border-slate-900">
                              +{product.images.length - 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-white block">{product.name}</span>
                          {product.subCategory && (
                            <span className="text-xs text-slate-500">{product.subCategory}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-800 text-slate-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      {product.stockQuantity || product.stock || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Image size={14} className="text-slate-500" />
                        <span className="text-sm">{product.images?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border",
                        product.inStock 
                          ? "bg-green-500/10 text-green-400 border-green-500/20" 
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
                          className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                          disabled={deleteMutation.isPending}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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