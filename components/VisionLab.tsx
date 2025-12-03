
import React, { useState } from 'react';
import { generateStrategicImage, editBrandAsset } from '../services/geminiService';
import { AspectRatio } from '../types';

export const VisionLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // For editing
  const [editImageFile, setEditImageFile] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const img = await generateStrategicImage(prompt, aspectRatio);
      setGeneratedImage(img);
    } catch (e) {
      alert("Image generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !editImageFile) return;
    setLoading(true);
    try {
      const img = await editBrandAsset(editImageFile, prompt);
      setGeneratedImage(img);
    } catch (e) {
      alert("Image edit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-8 print:hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-serif font-bold text-gray-900">ScaleOn Vision Lab</h3>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => { setActiveTab('generate'); setGeneratedImage(null); }}
            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${activeTab === 'generate' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Generate
          </button>
          <button 
            onClick={() => { setActiveTab('edit'); setGeneratedImage(null); }}
            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${activeTab === 'edit' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Edit Assets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {activeTab === 'generate' ? (
            <>
              <p className="text-sm text-gray-500">Describe a strategic visual (e.g., "A futuristic roadmap for a fintech company").</p>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Aspect Ratio</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Portrait)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="3:4">3:4 (Vertical)</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Upload a brand asset and describe changes (e.g., "Make it look professional").</p>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
              {editImageFile && (
                <div className="mt-2 h-32 w-full bg-gray-200 rounded-lg overflow-hidden relative">
                   <img src={editImageFile} alt="Preview" className="w-full h-full object-cover opacity-50" />
                   <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600">Source Image</div>
                </div>
              )}
            </>
          )}

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={activeTab === 'generate' ? "Describe your vision..." : "Describe your edit..."}
            className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none"
          ></textarea>

          <button 
            onClick={activeTab === 'generate' ? handleGenerate : handleEdit}
            disabled={loading || (activeTab === 'edit' && !editImageFile)}
            className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              activeTab === 'generate' ? "Generate Visual" : "Apply Edits"
            )}
          </button>
        </div>

        <div className="bg-gray-200 rounded-lg flex items-center justify-center min-h-[300px] border-2 border-dashed border-gray-300 relative overflow-hidden group">
          {generatedImage ? (
            <div className="relative w-full h-full">
               <img src={generatedImage} alt="Result" className="w-full h-full object-contain" />
               <a 
                 href={generatedImage} 
                 download="scaleon-vision.png"
                 className="absolute bottom-4 right-4 bg-white/90 text-gray-900 px-3 py-1 rounded text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
               >
                 Download
               </a>
            </div>
          ) : (
            <div className="text-center text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <span>Result will appear here</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
