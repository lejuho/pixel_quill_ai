import {
  BookOpen,
  FileText,
  Map,
  MessageSquare,
  MousePointerClick,
  Package,
  PenSquare,
  Sparkles,
  Swords,
  User,
  Wand2
} from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { GeneratedText } from "@/entities/GeneratedText";
import GeneratedTextDisplay from "../components/generator/GeneratedTextDisplay";
import { InvokeLLM } from "@/integrations/Core";
import ParameterControls from "../components/generator/ParameterControls";
import TextTypeSelector from "../components/generator/TextTypeSelector";
import { motion } from "framer-motion";

// --- START: 타입 정의 추가 ---

type TextLength = "short" | "medium" | "long";

type TextType =
  | "dialogue"
  | "item_description"
  | "character_name"
  | "location_description"
  | "quest_text"
  | "lore"
  | "story_snippet"
  | "ui_text"
  | "combat_text"
  | "other";

interface ParametersState {
  genre: string;
  tone: string;
  length: TextLength;
  title: string;
}

interface TextTypeInfo {
  id: TextType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// --- END: 타입 정의 추가 ---

const textTypes: TextTypeInfo[] = [
  {
    id: 'dialogue',
    label: 'Dialogue',
    description: 'Create engaging conversations between characters.',
    icon: MessageSquare,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'item_description',
    label: 'Item Description',
    description: 'Write flavorful descriptions for items and loot.',
    icon: Package,
    color: 'from-orange-500 to-amber-400',
  },
  {
    id: 'character_name',
    label: 'Character Name',
    description: 'Generate unique and fitting names for characters.',
    icon: User,
    color: 'from-green-500 to-emerald-400',
  },
  {
    id: 'location_description',
    label: 'Location Description',
    description: 'Describe vivid and immersive game locations.',
    icon: Map,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'quest_text',
    label: 'Quest Text',
    description: 'Write compelling quest descriptions and objectives.',
    icon: FileText,
    color: 'from-yellow-500 to-amber-400',
  },
  {
    id: 'lore',
    label: 'Lore / Backstory',
    description: 'Develop rich world history and background stories.',
    icon: BookOpen,
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'story_snippet',
    label: 'Story Snippet',
    description: 'Generate short narrative pieces to build your story.',
    icon: PenSquare,
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'ui_text',
    label: 'UI Text',
    description: 'Create clear and concise text for menus and buttons.',
    icon: MousePointerClick,
    color: 'from-gray-500 to-slate-400',
  },
  {
    id: 'combat_text',
    label: 'Combat Text',
    description: 'Write dynamic descriptions for actions in combat.',
    icon: Swords,
    color: 'from-red-600 to-orange-500',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Generate any other type of creative text content.',
    icon: Wand2,
    color: 'from-pink-500 to-rose-400',
  },
];


export default function Generator() {
  const [selectedType, setSelectedType] = useState<TextType | "">("");
  const [parameters, setParameters] = useState<ParametersState>({
    genre: "",
    tone: "",
    length: "medium",
    title: ""
  });
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const handleParameterChange = (key: keyof ParametersState, value: string) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const buildPrompt = () => {
    if (!selectedType) return "";

    const typeDescriptions: Record<TextType, string> = {
      dialogue: "character dialogue and conversation",
      item_description: "detailed item description",
      character_name: "creative character names",
      location_description: "immersive location description",
      quest_text: "engaging quest description",
      lore: "rich world lore and backstory",
      story_snippet: "compelling story narrative",
      ui_text: "clear and engaging UI text",
      combat_text: "dynamic combat description",
      other: "creative game text content"
    };

    const lengthDescriptions: Record<TextLength, string> = {
      short: "Keep it concise with 1-2 sentences",
      medium: "Write 3-5 sentences with good detail",
      long: "Create a longer piece with 6+ sentences and rich detail"
    };

    let prompt = `Create ${typeDescriptions[selectedType]} for a ${parameters.genre} game with a ${parameters.tone} tone. ${lengthDescriptions[parameters.length]}.`;
    
    if (customPrompt) {
      prompt += `\n\nAdditional context: ${customPrompt}`;
    }

    prompt += "\n\nMake sure the text feels authentic to the game genre and tone. Be creative and engaging.";
    
    return prompt;
  };

  const handleGenerate = async () => {
    if (!selectedType || !parameters.genre || !parameters.tone) {
      return;
    }

    setIsGenerating(true);
    setGeneratedText("");
    try {
      const result = await InvokeLLM({
        prompt: buildPrompt()
      });
      setGeneratedText(result);
    } catch (error) {
      console.error("Error generating text:", error);
    }
    setIsGenerating(false);
  };

  const handleSave = async (textToSave: string = generatedText) => {
    if (!textToSave || !selectedType) return;
    
    setIsSaving(true);
    try {
      await GeneratedText.create({
        title: parameters.title || `Generated ${selectedType.replace(/_/g, ' ')}`,
        content: textToSave,
        text_type: selectedType,
        genre: parameters.genre,
        tone: parameters.tone,
        length: parameters.length,
        tags: []
      });
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving text:", error);
    }
    setIsSaving(false);
  };

  const handleCopy = () => {
    if (!generatedText) return;
    
    const textArea = document.createElement("textarea");
    textArea.value = generatedText;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error("Failed to copy text:", error);
    }

    document.body.removeChild(textArea);
  };

  const handleExport = () => {
    if (!generatedText) return;
    const element = document.createElement("a");
    const file = new Blob([generatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${parameters.title.replace(/\s+/g, '_') || 'generated-text'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const canGenerate = selectedType && parameters.genre && parameters.tone;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI Game Text Generator
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Create compelling game content with the power of AI. From dialogue to lore, generate everything your indie game needs.
          </p>
        </motion.div>

        {/* Step 1: Text Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <TextTypeSelector 
            selectedType={selectedType}
            onTypeSelect={(type: string) => setSelectedType(type as TextType | "")}
            textTypes={textTypes}
          />
        </motion.div>

        {/* Step 2: Parameters */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ParameterControls 
              parameters={parameters}
              onParameterChange={(key: string, value: string) => handleParameterChange(key as keyof ParametersState, value)}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
            />
          </motion.div>
        )}

        {/* Generate Button */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold glow"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Step 3: Generated Text Display */}
        <GeneratedTextDisplay 
          generatedText={generatedText}
          title={parameters.title}
          onTitleChange={(title) => handleParameterChange('title', title)}
          isGenerating={isGenerating}
          onRegenerate={handleGenerate}
          onSave={handleSave}
          onCopy={handleCopy}
          onExport={handleExport}
          isSaving={isSaving}
          showSaveSuccess={showSaveSuccess}
        />
      </div>
    </div>
  );
}

