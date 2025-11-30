import React, { useState } from 'react';
import { ChefHat, Wand2 } from 'lucide-react';
import ChefView from './components/ChefView';
import EditorView from './components/EditorView';

enum AppMode {
  CHEF = 'CHEF',
  EDITOR = 'EDITOR'
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHEF);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <header className="w-full flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary to-orange-600 p-2 rounded-lg">
            <ChefHat className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
              NanoChef & Studio
            </h1>
            <p className="text-gray-400 text-sm">Powered by Gemini 2.5 Flash Image</p>
          </div>
        </div>

        <nav className="flex bg-card p-1 rounded-xl shadow-lg border border-gray-700/50">
          <button
            onClick={() => setMode(AppMode.CHEF)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === AppMode.CHEF
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ChefHat size={18} />
            Chef Mode
          </button>
          <button
            onClick={() => setMode(AppMode.EDITOR)}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === AppMode.EDITOR
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wand2 size={18} />
            Editor Mode
          </button>
        </nav>
      </header>

      <main className="w-full flex-1">
        {mode === AppMode.CHEF ? <ChefView /> : <EditorView />}
      </main>
      
      <footer className="w-full text-center py-6 text-gray-500 text-xs mt-8 border-t border-gray-800">
        <p>Built with React, Tailwind, and Google Gemini API</p>
      </footer>
    </div>
  );
};

export default App;