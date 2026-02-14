import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Image, Palette, Youtube } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  category: 'Men' | 'Women';
  subCategory: string;
  price: number;
  stockQuantity: number;
  inStock: boolean;
  isNewArrival: boolean;
  sizes: string[];
  colors: Array<{
    name: string;
    image?: File;
    imagePreview?: string;
  }>;
  videoUrl: string;
}

const ProductForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: 'Men',
      subCategory: '',
      price: 0,
      stockQuantity: 100,
      inStock: true,
      isNewArrival: false,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black' }],
      videoUrl: '',
    }
  });

  const { fields: colorFields, append: appendColor, remove: removeColor, update: updateColor } = useFieldArray({
    control,
    name: "colors"
  });

  const [colorImageFiles, setColorImageFiles] = useState<{ [key: number]: File }>({});
  const [colorImagePreviews, setColorImagePreviews] = useState<{ [key: number]: string }>({});

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      console.log('Creating FormData with:', {
        ...data,
        imageCount: imageFiles.length,
        colorImageCount: Object.keys(colorImageFiles).length,
        videoUrl: data.videoUrl
      });
      
      // Append basic fields
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('subCategory', data.subCategory);
      formData.append('price', data.price.toString());
      formData.append('stockQuantity', data.stockQuantity.toString());
      formData.append('inStock', data.inStock.toString());
      formData.append('isNew', data.isNewArrival.toString());
      formData.append('sizes', JSON.stringify(data.sizes));
      formData.append('videoUrl', data.videoUrl || '');
      
      // Append colors with their images
      const colorsData = data.colors.map((color, index) => ({
        name: color.name,
        image: colorImagePreviews[index] || null
      }));
      formData.append('colors', JSON.stringify(colorsData));
      
      // Append color images
      Object.entries(colorImageFiles).forEach(([index, file]) => {
        formData.append(`colorImages`, file as File);
        formData.append(`colorIndexes`, index);
      });
      
      // Append main product images
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      return api.createProduct(formData);
    },
    onSuccess: (response) => {
      console.log('Create product response:', response);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Product created successfully');
        navigate('/products');
      } else {
        toast.error(response.message || 'Failed to create product');
      }
    },
    onError: (error: any) => {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    
    const totalImages = imageFiles.length + newFiles.length;
    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed per product');
      return;
    }

    setImageFiles(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file: File) => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleColorImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (colorImagePreviews[index]) {
      URL.revokeObjectURL(colorImagePreviews[index]);
    }
    
    setColorImageFiles(prev => ({ ...prev, [index]: file }));
    const preview = URL.createObjectURL(file);
    setColorImagePreviews(prev => ({ ...prev, [index]: preview }));
  };

  const removeColorImage = (index: number) => {
    if (colorImagePreviews[index]) {
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
    appendColor({ name: '' });
  };

  const removeColorField = (index: number) => {
    removeColorImage(index);
    removeColor(index);
  };

  const onSubmit = (data: ProductFormData) => {
    console.log('Form submitted with data:', data);
    
    if (imageFiles.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    const missingColorImages = data.colors.some((_, index) => !colorImageFiles[index]);
    if (missingColorImages) {
      toast.error('Please upload an image for each color');
      return;
    }
    
    createMutation.mutate(data);
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Product Name *</label>
                <input 
                  {...register('name', { required: 'Name is required' })}
                  className="w-full bg-background border border-slate-700 rounded-md px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Classic Cotton T-Shirt"
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                  <select 
                    {...register('category', { required: true })}
                    className="w-full bg-background border border-slate-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Sub-Category *</label>
                  <input 
                    {...register('subCategory', { required: 'Sub-category is required' })}
                    className="w-full bg-background border border-slate-700 rounded-md px-3 py-2 text-white"
                    placeholder="e.g. T-Shirts"
                  />
                  {errors.subCategory && <span className="text-red-500 text-xs">{errors.subCategory.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                <textarea 
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full bg-background border border-slate-700 rounded-md px-3 py-2 text-white"
                  placeholder="Product description..."
                />
                {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
              </div>
            </div>
          </Card>

          <Card title="Pricing & Inventory">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Price (Rs.) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { 
                    required: 'Price is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="w-full bg-background border border-slate-700 rounded-md px-3 py-2 text-white"
                />
                {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Stock Quantity *</label>
                <input 
                  type="number"
                  min="0"
                  {...register('stockQuantity', { 
                    required: 'Stock quantity is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Stock must be positive' }
                  })}
                  className="w-full bg-background border border-slate-700 rounded-md px-3 py-2 text-white"
                />
                {errors.stockQuantity && <span className="text-red-500 text-xs">{errors.stockQuantity.message}</span>}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
               <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                 <input 
                   type="checkbox" 
                   {...register('inStock')} 
                   className="rounded border-slate-700 bg-background text-indigo-600 focus:ring-indigo-500" 
                 />
                 <span>In Stock</span>
               </label>
               <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                 <input 
                   type="checkbox" 
                   {...register('isNewArrival')} 
                   className="rounded border-slate-700 bg-background text-indigo-600 focus:ring-indigo-500" 
                 />
                 <span>New Arrival</span>
               </label>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Media *">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Product Images</span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Image size={12} />
                <span>{imageFiles.length}/10</span>
              </div>
            </div>
            
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors">
                <Upload className="h-10 w-10 text-slate-500 mb-2" />
                <p className="text-sm text-slate-400">Click to upload images</p>
                <p className="text-xs text-slate-600 mt-1">Max 10 images, 5MB each (JPG, PNG, WebP)</p>
                <p className="text-xs text-slate-500 mt-1">Images uploaded: {imageFiles.length}</p>
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
                <p className="text-sm text-slate-300 mb-2">Uploaded Images</p>
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square bg-slate-800 rounded-md overflow-hidden group border border-slate-700">
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/80 p-1 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
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
            
            {imageFiles.length === 0 && (
              <p className="text-sm text-red-400 mt-2">At least one product image is required</p>
            )}
          </Card>

          {/* YouTube Video Section */}
          <Card title="Product Video">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    YouTube Video URL (Optional)
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      {...register('videoUrl')}
                      className="w-full bg-background border border-slate-700 rounded-md pl-10 pr-3 py-2 text-white text-sm placeholder:text-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Add a YouTube video to showcase your product in action
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Colors with Images">
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
                            className="w-full bg-background border border-slate-700 rounded-md px-3 py-2 text-white text-sm"
                            placeholder="e.g. Black, Blue, Red"
                          />
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeColorField(index)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                          >
                            <X size={16} />
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
          </Card>

          <Card title="Sizes">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Available Sizes *</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <label key={size} className="inline-flex items-center">
                    <input 
                      type="checkbox"
                      value={size}
                      {...register('sizes')}
                      className="sr-only peer"
                      defaultChecked={['S', 'M', 'L', 'XL'].includes(size)}
                    />
                    <div className="px-3 py-2 border border-slate-700 rounded cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 peer-checked:text-indigo-400 hover:bg-slate-800 transition-colors">
                      <span className="text-sm">{size}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </Card>
          
          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              isLoading={createMutation.isPending} 
              size="lg"
              disabled={imageFiles.length === 0 || Object.keys(colorImageFiles).length !== colorFields.length}
            >
              {createMutation.isPending ? 'Creating...' : 'Save Product'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/products')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;