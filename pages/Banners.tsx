import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const Banners = () => {
  const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: api.getBanners });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Banner Management</h1>
          <p className="text-slate-400">Manage homepage sliders and promotional banners.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={18} /> Add New Banner
        </Button>
      </div>

      <div className="grid gap-6">
        {banners?.banners.map((banner) => (
          <Card key={banner.id} className="relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden relative">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button size="sm" variant="secondary">Change Image</Button>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                    <p className="text-slate-400">{banner.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${banner.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-3 rounded">
                    <p className="text-xs text-slate-500 uppercase mb-1">Button Text</p>
                    <p className="text-white text-sm">{banner.buttonText || '-'}</p>
                  </div>
                   <div className="bg-slate-800 p-3 rounded">
                    <p className="text-xs text-slate-500 uppercase mb-1">Position</p>
                    <p className="text-white text-sm">#{banner.position}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-move text-slate-600 hover:text-slate-400 hover:bg-slate-800/50">
               <GripVertical size={16} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Banners;