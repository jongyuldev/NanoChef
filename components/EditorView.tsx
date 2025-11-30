import React, { useState } from 'react';
import { Wand2, Loader2, Download, AlertCircle, RefreshCw, SendHorizontal } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { editImage } from '../services/gemini';
import { ImageData, LoadingState } from '../types';

const EditorView: React.FC = () => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (imgData: ImageData) => {
    setImage(imgData);
    setPreviewUrl(`data:${imgData.mimeType};base64,${imgData.base64}`);
    setResultImage(null);
    setError(null);
  };

  const handleClear = () => {
    setImage(null);
    setPreviewUrl(null);
    setResultImage(null);
    setError(null);
    setLoadingState(LoadingState.IDLE);
    setPrompt('');
  };

  const handleEdit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!image || !prompt.trim()) return;

    setLoadingState(LoadingState.GENERATING);
    setError(null);
    setResultImage(null);

    try {
      const { imageBase64 } = await editImage(image, prompt);
      
      if (imageBase64) {
        setResultImage(`data:image/png;base64,${imageBase64}`);
        setLoadingState(LoadingState.COMPLETE);
      } else {
        throw new Error("The model did not return an image. Try refining your prompt.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process image. Make sure your request is clear.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Left Column: Input */}
      <div className="flex flex-col gap-6">
        <div className="bg-card rounded-2xl p-6 border border-gray-700 shadow-xl h-full flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-purple-600/20 text-purple-400 p-2 rounded-lg"><Wand2 size={20} /></span>
            Source Image & Prompt
          </h2>
          
          <ImageUploader 
            selectedImage={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClear}
            label="Upload image to edit"
          />

          <form onSubmit={handleEdit} className="mt-6 flex flex-col gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                What would you like to change?
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Add a retro filter', 'Make it look like a sketch', 'Add a cat in the background'"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none h-32"
                  disabled={loadingState === LoadingState.GENERATING}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!image || !prompt.trim() || loadingState === LoadingState.GENERATING}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                !image || !prompt.trim()
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : loadingState === LoadingState.GENERATING
                  ? 'bg-gray-700 text-gray-300 cursor-wait'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transform hover:-translate-y-0.5'
              }`}
            >
              {loadingState === LoadingState.GENERATING ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Generate Edit
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200 flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="flex flex-col h-full">
        <div className="bg-card rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="p-6 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="text-purple-400">Result</span>
            </h2>
            {resultImage && (
              <a 
                href={resultImage} 
                download="gemini-edit.png"
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={14} /> Download
              </a>
            )}
          </div>
          
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/20 relative">
            {loadingState === LoadingState.IDLE && !resultImage && (
              <div className="text-center text-gray-500 gap-4 flex flex-col items-center">
                <Wand2 size={48} className="opacity-20" />
                <p>Generated image will appear here</p>
              </div>
            )}

            {loadingState === LoadingState.GENERATING && (
              <div className="flex flex-col items-center justify-center gap-6">
                 <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 size={20} className="text-purple-500" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium text-gray-200">Applying Magic...</p>
                  <p className="text-sm text-gray-500">Gemini is processing your request</p>
                </div>
              </div>
            )}

            {resultImage && (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={resultImage} 
                  alt="AI Generated Result" 
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorView;