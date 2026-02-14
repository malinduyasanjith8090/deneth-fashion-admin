import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Product } from '../../types';
import { formatCurrency, cn } from '../../utils/cn';
import { Plus, Search, Filter, Pencil, Trash2, Image, Grid, List, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductEditModal from './ProductEditModal';

const ProductList = () => {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
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

  // Apply filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.subCategory?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesStock = filterStock === 'all' || 
      (filterStock === 'in-stock' && p.inStock) ||
      (filterStock === 'out-of-stock' && !p.inStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Get cover image
  const getCoverImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch('');
    setFilterCategory('all');
    setFilterStock('all');
    setShowFilters(false);
  };

  // Grid View Card (for mobile/tablet)
  const GridProductCard = ({ product }: { product: Product }) => (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-900">
        <img 
          src={getCoverImage(product)} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        
        {/* Image Count Badge */}
        {product.images && product.images.length > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
            <Image size={12} />
            <span>{product.images.length}</span>
          </div>
        )}
        
        {/* Stock Status Badge */}
        <div className={cn(
          "absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium",
          product.inStock 
            ? "bg-green-500/90 text-white" 
            : "bg-red-500/90 text-white"
        )}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <div className="mb-2">
          <h3 className="font-medium text-white text-sm line-clamp-1">{product.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{product.subCategory}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-indigo-400 font-bold text-sm">
            {formatCurrency(product.price)}
          </span>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleEditClick(product)}
              className="p-2 bg-slate-700 rounded-lg text-slate-300 hover:text-indigo-400 hover:bg-slate-600 transition-all"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={() => handleDelete(product._id)}
              className="p-2 bg-slate-700 rounded-lg text-slate-300 hover:text-red-400 hover:bg-slate-600 transition-all"
              disabled={deleteMutation.isPending}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Category Tag */}
        <div className="mt-2 pt-2 border-t border-slate-700">
          <span className="inline-block px-2 py-0.5 bg-slate-700 rounded-full text-[10px] text-slate-300">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );

  // List View Card (alternative for tablets)
  const ListProductCard = ({ product }: { product: Product }) => (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all duration-300">
      <div className="flex p-3 gap-3">
        {/* Image */}
        <div className="relative flex-shrink-0">
          <img 
            src={getCoverImage(product)} 
            alt={product.name}
            className="w-20 h-20 rounded-lg object-cover bg-slate-900"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
            }}
          />
          {product.images && product.images.length > 1 && (
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center border-2 border-slate-800">
              +{product.images.length - 1}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-white text-sm truncate">{product.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{product.subCategory}</p>
            </div>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
              product.inStock 
                ? "bg-green-500/20 text-green-400" 
                : "bg-red-500/20 text-red-400"
            )}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-indigo-400 font-bold text-sm">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-slate-500 ml-2">
                <Image size={12} className="inline mr-1" />
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
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Products</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Manage your inventory and product listings
              </p>
            </div>
            
            <Link to="/products/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm">
                <Plus size={16} />
                <span>Add Product</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Search and Filter Bar */}
        <div className="mb-4 space-y-3">
          {/* Search Row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            {/* View Toggle (Mobile) */}
            <div className="flex sm:hidden bg-slate-800 rounded-lg border border-slate-700 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                )}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                )}
              >
                <List size={18} />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
            >
              <Filter size={16} />
              <ChevronDown size={14} className={cn("transition-transform", showFilters && "rotate-180")} />
            </button>

            {/* Desktop Filters */}
            <div className="hidden sm:flex items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>

              {(filterCategory !== 'all' || filterStock !== 'all' || search) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="sm:hidden bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-4 animate-slideDown">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">Stock Status</label>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white"
                >
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters (Mobile) */}
          {(filterCategory !== 'all' || filterStock !== 'all') && (
            <div className="flex flex-wrap gap-2 sm:hidden">
              {filterCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-full text-xs">
                  {filterCategory}
                  <X size={12} className="cursor-pointer" onClick={() => setFilterCategory('all')} />
                </span>
              )}
              {filterStock !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-full text-xs">
                  {filterStock === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                  <X size={12} className="cursor-pointer" onClick={() => setFilterStock('all')} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-400">
            Showing <span className="text-white font-medium">{filteredProducts.length}</span> of{' '}
            <span className="text-white font-medium">{products.length}</span> products
          </p>
          
          {/* View Toggle (Desktop) */}
          <div className="hidden sm:flex bg-slate-800 rounded-lg border border-slate-700 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
              title="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded transition-colors",
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              )}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="text-slate-400 mt-4">Loading products...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="max-w-md mx-auto px-4">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No products found</h3>
              <p className="text-sm text-slate-400 mb-6">
                {search || filterCategory !== 'all' || filterStock !== 'all'
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first product"}
              </p>
              {(search || filterCategory !== 'all' || filterStock !== 'all') ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link to="/products/new">
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Add Product
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Product Grid/List View */}
        {!isLoading && filteredProducts.length > 0 && (
          <>
            {/* Mobile View (grid or list based on selection) */}
            <div className="sm:hidden">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredProducts.map((product) => (
                    <GridProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <ListProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* Tablet View (always grid for better space usage) */}
            <div className="hidden sm:block md:hidden">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <GridProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>

            {/* Desktop View (grid only) */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <GridProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          </>
        )}

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
    </div>
  );
};

export default ProductList;