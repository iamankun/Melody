'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Brain, Cloud, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Model {
  id: string;
  name: string;
  provider: 'local' | 'cloud';
  description: string;
  icon: React.ReactNode;
}

const availableModels: Model[] = [
  {
    id: 'ollama/llama3',
    name: 'Llama 3',
    provider: 'local',
    description: 'Model local, nhanh và riêng tư',
    icon: <Server className="w-4 h-4" />
  },
  {
    id: 'ollama/gemma:7b',
    name: 'Gemma 7B',
    provider: 'local',
    description: 'Model Google local nhẹ và nhanh',
    icon: <Server className="w-4 h-4" />
  },
  {
    id: 'ollama/sorc/qwen3.5-claude-4.6-opus',
    name: 'Qwen 3.5 Claude Opus',
    provider: 'local',
    description: 'Model custom local nâng cao',
    icon: <Server className="w-4 h-4" />
  },
];

// Gemini model chỉ thêm nếu có API key
const geminiModel: Model = {
  id: 'googleai/gemini-1.5-flash',
  name: 'Gemini 1.5 Flash',
  provider: 'cloud',
  description: 'Model cloud của Google, thông minh và nhanh',
  icon: <Cloud className="w-4 h-4" />
};

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
  geminiAvailable?: boolean;
}

export function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  disabled = false, 
  className, 
  geminiAvailable = false 
}: ModelSelectorProps) {
  // Kết hợp models - chỉ thêm Gemini nếu có API key
  const allModels = geminiAvailable 
    ? [...availableModels, geminiModel] 
    : availableModels;
    
  const currentModel = allModels.find(m => m.id === selectedModel) || allModels[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("w-full justify-between model-selector-button", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="truncate">{currentModel.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {currentModel.provider === 'local' ? (
              <Server className="w-3 h-3" />
            ) : (
              <Cloud className="w-3 h-3" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-lg model-selector-dropdown">
        {allModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex items-center gap-3 p-3 rounded-md"
          >
            {model.icon}
            <div className="flex-1">
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-muted-foreground">
                {model.description}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {model.provider === 'local' ? 'Local' : 'Cloud'}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
