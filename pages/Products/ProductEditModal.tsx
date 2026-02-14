import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import { X, Upload, Trash2, Image, Palette, Youtube } from 'lucide-react';

interface ProductEditModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ColorFormData {
  name: string;
  image: string;
  imageFile?: File;
}

interface ProductFormData {
  name: string;
  description: string;
  category: 'Men' | 'Women';
  subCategory: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  isNew: boolean;
  sizes: string[];
  colors: ColorFormData[];
  existingImages?: string[];
  newImages?: File[];
  videoUrl: string;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
  const [colorImageFiles, setColorImageFiles] = useState<{ [key: number]: File }>({});
  const [colorImagePreviews, setColorImagePreviews] = useState<{ [key: number]: string }>({});
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: 'Men',
      subCategory: '',
      price: 0,
      stockQuantity: 100,
      inStock: true,
      isNew: false,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', image: '' }],
      existingImages: [],
      newImages: [],
      videoUrl: ''
    }
  });

  useEffect(() => {
    if (product) {
      const colors = product.colors?.map((c: any) => ({
        name: c.name,
        image: c.image || ''
      })) || [{ name: 'Black', image: '' }];
      
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory || '',
        price: product.price,
        stockQuantity: product.stockQuantity || product.stock || 100,
        inStock: product.inStock,
        isNew: product.isNew || false,
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
        colors: colors,
        existingImages: product.images || [],
        videoUrl: product.videoUrl || ''
      });
      
      setExistingImages(product.images || []);
      
      const colorPreviews: { [key: number]: string } = {};
      colors.forEach((color, index) => {
        if (color.image) {
          colorPreviews[index] = color.image;
        }
      });
      setColorImagePreviews(colorPreviews);
      
      setImageFiles([]);
      setImagePreviews([]);
      setColorImageFiles({});
    }
  }, [product, reset]);

  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control,
    name: "colors"
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('subCategory', data.subCategory);
      formData.append('price', data.price.toString());
      formData.append('stockQuantity', data.stockQuantity.toString());
      formData.append('inStock', data.inStock.toString());
      formData.append('isNew', data.isNew.toString());
      formData.append('sizes', JSON.stringify(data.sizes));
      formData.append('videoUrl', data.videoUrl || '');
      
      const colorsData = data.colors.map((color, index) => ({
        name: color.name,
        image: colorImagePreviews[index] || color.image || ''
      }));
      formData.append('colors', JSON.stringify(colorsData));
      
      Object.entries(colorImageFiles).forEach(([index, file]) => {
        formData.append('colorImages', file);
        formData.append('colorIndexes', index);
      });
      
      formData.append('existingImages', JSON.stringify(existingImages));
      
      imageFiles.forEach((file) => {
        formData.append('newImages', file);
      });
      
      return api.updateProduct(product._id, formData);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update product');
      }
    },
    onError: (error: any) => {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = existingImages.length + imageFiles.length + newFiles.length;
    
    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed per product');
      return;
    }

    setImageFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleColorImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (colorImagePreviews[index] && colorImagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(colorImagePreviews[index]);
    }
    
    setColorImageFiles(prev => ({ ...prev, [index]: file }));
    const preview = URL.createObjectURL(file);
    setColorImagePreviews(prev => ({ ...prev, [index]: preview }));
  };

  const removeColorImage = (index: number) => {
    if (colorImagePreviews[index] && colorImagePreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(colorImagePreviews[index]);
    }
    setColorImageFiles(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
    setColorImagePreviews(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const addColor = () => {
    appendColor({ name: '', image: '' });
  };

  const removeColorField = (index: number) => {
    removeColorImage(index);
    removeColor(index);
  };

  const onSubmit = (data: ProductFormData) => {
    if (existingImages.length === 0 && imageFiles.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    const missingColorImages = data.colors.some((color, index) => {
      return !color.image && !colorImagePreviews[index];
    });
    
    if (missingColorImages) {
      toast.error('Please upload an image for each color');
      return;
    }
    
    updateMutation.mutate(data);
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-5xl bg-slate-900 rounded-lg shadow-xl border border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-white">Edit Product</h2>
              <p className="text-sm text-slate-400">Update product details</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Product Name *
                  </label>
                  <input 
                    {...register('name', { required: 'Name is required' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs">{errors.name.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category *
                    </label>
                    <select 
                      {...register('category', { required: true })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Sub-Category *
                    </label>
                    <input 
                      {...register('subCategory', { required: 'Sub-category is required' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                    />
                    {errors.subCategory && (
                      <span className="text-red-500 text-xs">{errors.subCategory.message}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Description *
                  </label>
                  <textarea 
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs">{errors.description.message}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Price (Rs.) *
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { 
                        required: 'Price is required',
                        valueAsNumber: true
                      })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                    />
                    {errors.price && (
                      <span className="text-red-500 text-xs">{errors.price.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Stock Quantity *
                    </label>
                    <input 
                      type="number"
                      min="0"
                      {...register('stockQuantity', { 
                        required: 'Stock quantity is required',
                        valueAsNumber: true
                      })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                    />
                    {errors.stockQuantity && (
                      <span className="text-red-500 text-xs">{errors.stockQuantity.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      {...register('inStock')} 
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span>In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      {...register('isNew')} 
                      className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500" 
                    />
                    <span>New Arrival</span>
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Product Images */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Product Images *
                    </label>
                    <div className="text-xs text-slate-500">
                      Total: {existingImages.length + imageFiles.length}/10
                    </div>
                  </div>
                  
                  {existingImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 mb-2">Existing Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {existingImages.map((img, index) => (
                          <div key={index} className="relative aspect-square rounded overflow-hidden border border-slate-700">
                            <img 
                              src={img} 
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute top-1 right-1 bg-black/80 p-1 rounded-full text-white hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-indigo-600 text-white px-2 py-0.5 rounded text-xs">
                                Cover
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors">
                      <Upload className="h-8 w-8 text-slate-500 mb-2" />
                      <p className="text-sm text-slate-400">Add new images</p>
                      <p className="text-xs text-slate-600 mt-1">Max 10 images total, 5MB each</p>
                    </div>
                    <input 
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-400 mb-2">New Images to Upload:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded overflow-hidden border border-indigo-500/50">
                            <img 
                              src={preview} 
                              alt={`New ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-black/80 p-1 rounded-full text-white hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* YouTube Video Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Product Video
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      {...register('videoUrl')}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-3 py-2 text-white text-sm placeholder:text-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Optional: Add a YouTube video to showcase your product
                  </p>
                </div>

                {/* Colors with Images */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Colors with Images *
                  </label>
                  <div className="space-y-4">
                    {colorFields.map((field, index) => (
                      <div key={field.id} className="border border-slate-700 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                              Color Name *
                            </label>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <input
                                  {...register(`colors.${index}.name` as const, { 
                                    required: 'Color name is required' 
                                  })}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm"
                                  placeholder="e.g. Black, Blue, Red"
                                />
                              </div>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeColorField(index)}
                                  className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Color Image *
                          </label>
                          <div className="flex items-center gap-3">
                            {colorImagePreviews[index] ? (
                              <div className="relative w-20 h-20 rounded-md overflow-hidden border border-slate-700">
                                <img 
                                  src={colorImagePreviews[index]} 
                                  alt={`Color ${index}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeColorImage(index)}
                                  className="absolute top-1 right-1 bg-black/80 p-1 rounded-full text-white hover:bg-red-600"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-slate-800 rounded-md border border-slate-700 flex flex-col items-center justify-center">
                                <Palette className="w-6 h-6 text-slate-600" />
                                <span className="text-[10px] text-slate-500 mt-1">No image</span>
                              </div>
                            )}
                            
                            <label className="flex-1 cursor-pointer">
                              <div className="border border-dashed border-slate-700 rounded-md p-3 text-center hover:border-indigo-500 transition-colors">
                                <Upload className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs text-slate-400">
                                  {colorImagePreviews[index] ? 'Change image' : 'Upload image'}
                                </p>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleColorImageUpload(index, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addColor}
                      className="w-full"
                    >
                      Add Color
                    </Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Available Sizes *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                      <label key={size} className="inline-flex items-center">
                        <input 
                          type="checkbox"
                          value={size}
                          {...register('sizes')}
                          className="sr-only peer"
                        />
                        <div className="px-3 py-2 border border-slate-700 rounded cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 peer-checked:text-indigo-400 hover:bg-slate-800 transition-colors">
                          <span className="text-sm">{size}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                disabled={updateMutation.isPending || (existingImages.length === 0 && imageFiles.length === 0)}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEditModal;