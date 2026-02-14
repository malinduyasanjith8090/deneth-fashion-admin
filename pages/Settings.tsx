import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Save, Facebook, Instagram, Phone, MapPin, Mail } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Store Settings</h1>
          <p className="text-slate-400">Configure general store information.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Save size={18} /> Save Changes
        </Button>
      </div>

      <Card title="General Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Store Name</label>
            <input type="text" defaultValue="Deneth Fashion" className="w-full bg-background border border-slate-700 rounded px-3 py-2 text-white" />
          </div>
           <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Support Email</label>
             <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input type="email" defaultValue="support@denethfashion.com" className="w-full bg-background border border-slate-700 rounded pl-10 pr-3 py-2 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Phone Number</label>
             <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input type="tel" defaultValue="+94 77 123 4567" className="w-full bg-background border border-slate-700 rounded pl-10 pr-3 py-2 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Address</label>
             <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input type="text" defaultValue="No 123, Galle Road, Colombo 03" className="w-full bg-background border border-slate-700 rounded pl-10 pr-3 py-2 text-white" />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Shipping Configuration">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Colombo Delivery Fee (LKR)</label>
            <input type="number" defaultValue={250} className="w-full bg-background border border-slate-700 rounded px-3 py-2 text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Outstation Delivery Fee (LKR)</label>
            <input type="number" defaultValue={500} className="w-full bg-background border border-slate-700 rounded px-3 py-2 text-white" />
          </div>
        </div>
      </Card>

      <Card title="Social Media">
         <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 flex justify-center"><Facebook className="text-blue-500" /></div>
              <input type="text" placeholder="Facebook URL" className="flex-1 bg-background border border-slate-700 rounded px-3 py-2 text-white" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 flex justify-center"><Instagram className="text-pink-500" /></div>
              <input type="text" placeholder="Instagram URL" className="flex-1 bg-background border border-slate-700 rounded px-3 py-2 text-white" />
            </div>
         </div>
      </Card>
    </div>
  );
};

export default Settings;