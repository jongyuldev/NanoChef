import React, { useState, useEffect } from 'react';
import { ChefHat, Loader2, Sparkles, AlertCircle, ChevronLeft, ChevronRight, Clock, Gauge, Utensils, List } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { generateRecipes, generateMealImage } from '../services/gemini';
import { ImageData, LoadingState, Meal } from '../types';

const ChefView: React.FC = () => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [currentMealIndex, setCurrentMealIndex] = useState(0);
  const [mealImages, setMealImages] = useState<Record<number, string>>({});
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (imgData: ImageData) => {
    setImage(imgData);
    setPreviewUrl(`data:${imgData.mimeType};base64,${imgData.base64}`);
    setMeals([]);
    setMealImages({});
    setError(null);
  };

  const handleClear = () => {
    setImage(null);
    setPreviewUrl(null);
    setMeals([]);
    setMealImages({});
    setError(null);
    setLoadingState(LoadingState.IDLE);
  };

  const handleGenerate = async () => {
    if (!image) return;

    setLoadingState(LoadingState.GENERATING);
    setError(null);
    setMeals([]);
    setMealImages({});

    try {
      const generatedMeals = await generateRecipes(image);
      setMeals(generatedMeals);
      setLoadingState(LoadingState.COMPLETE);
      
      // Trigger image generation for all meals in background
      generatedMeals.forEach((meal, index) => {
        generateMealImage(meal.visualDescription).then(base64 => {
          if (base64) {
            setMealImages(prev => ({ ...prev, [index]: base64 }));
          }
        });
      });
      
    } catch (e) {
      console.error(e);
      setError("Failed to generate recipes. Please try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const nextMeal = () => {
    setCurrentMealIndex(prev => (prev + 1) % meals.length);
  };

  const prevMeal = () => {
    setCurrentMealIndex(prev => (prev - 1 + meals.length) % meals.length);
  };

  const currentMeal = meals[currentMealIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="bg-card rounded-2xl p-6 border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-primary/20 text-primary p-2 rounded-lg"><ChefHat size={20} /></span>
            Ingredients Input
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            Take a photo of your fridge or pantry contents. The AI will identify ingredients and suggest complete recipes.
          </p>
          
          <ImageUploader 
            selectedImage={previewUrl}
            onImageSelected={handleImageSelected}
            onClear={handleClear}
            label="Upload ingredients photo"
          />

          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={!image || loadingState === LoadingState.GENERATING}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                !image 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : loadingState === LoadingState.GENERATING
                  ? 'bg-gray-700 text-gray-300 cursor-wait'
                  : 'bg-gradient-to-r from-primary to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40 transform hover:-translate-y-0.5'
              }`}
            >
              {loadingState === LoadingState.GENERATING ? (
                <>
                  <Loader2 className="animate-spin" />
                  Analysing Ingredients...
                </>
              ) : (
                <>
                  <Sparkles />
                  Generate Meal Ideas
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200 flex items-start gap-3">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-gray-700 shadow-xl overflow-hidden flex flex-col min-h-[600px] relative">
        <div className="p-6 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="text-primary">Suggested Recipes</span>
          </h2>
          {meals.length > 0 && (
            <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              Recipe {currentMealIndex + 1} of {meals.length}
            </span>
          )}
        </div>
        
        <div className="flex-1 bg-gray-900/50 relative">
          {loadingState === LoadingState.IDLE && meals.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 absolute inset-0">
              <ChefHat size={48} className="opacity-20" />
              <p>Upload an image to start cooking</p>
            </div>
          )}

          {loadingState === LoadingState.GENERATING && (
            <div className="h-full flex flex-col items-center justify-center gap-6 absolute inset-0 z-20 bg-card">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat size={20} className="text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-200">The Chef is thinking...</p>
                <p className="text-sm text-gray-500">Identifying ingredients and crafting recipes</p>
              </div>
            </div>
          )}

          {currentMeal && (
            <div className="flex flex-col h-full animate-fade-in">
              {/* Meal Image Area */}
              <div className="w-full h-48 sm:h-64 relative bg-gray-900 group shrink-0">
                {mealImages[currentMealIndex] ? (
                  <img 
                    src={`data:image/png;base64,${mealImages[currentMealIndex]}`}
                    alt={currentMeal.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-800/50">
                    <Loader2 className="animate-spin mb-2" />
                    <span className="text-xs uppercase tracking-wider">Generating Dish Image...</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />
                
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{currentMeal.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-medium text-white flex items-center gap-1 border border-white/10">
                      <Clock size={12} className="text-primary" /> {currentMeal.cookingTime}
                    </span>
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-xs font-medium text-white flex items-center gap-1 border border-white/10">
                      <Gauge size={12} className="text-green-400" /> {currentMeal.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                    <Utensils size={18} /> Ingredients
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentMeal.ingredients.map((ing, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="block w-1.5 h-1.5 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-primary font-semibold mb-3">
                    <List size={18} /> Instructions
                  </h4>
                  <ol className="space-y-4">
                    {currentMeal.instructions.map((step, i) => (
                      <li key={i} className="flex gap-4 text-sm text-gray-300">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="mt-0.5 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                {/* Spacer for bottom navigation */}
                <div className="h-16"></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        {meals.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent flex justify-between items-center z-20">
             <button 
              onClick={prevMeal}
              className="p-3 rounded-full bg-gray-800/80 hover:bg-primary text-white backdrop-blur-sm border border-gray-700 transition-all shadow-lg hover:shadow-primary/25"
            >
              <ChevronLeft size={24} />
            </button>
            
            <div className="flex gap-2">
              {meals.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentMealIndex ? 'bg-primary w-6' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={nextMeal}
              className="p-3 rounded-full bg-gray-800/80 hover:bg-primary text-white backdrop-blur-sm border border-gray-700 transition-all shadow-lg hover:shadow-primary/25"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefView;