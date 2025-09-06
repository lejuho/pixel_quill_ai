import React, { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GeneratedText } from "@/entities/GeneratedText";
import GeneratedTextDisplay from "../components/generator/GeneratedTextDisplay";
import { InvokeLLM } from "@/integrations/Core";
import ParameterControls from "../components/generator/ParameterControls";
import TextTypeSelector from "../components/generator/TextTypeSelector";
import { motion } from "framer-motion";

export default function Generator() {
  const [selectedType, setSelectedType] = useState("");
  const [parameters, setParameters] = useState({
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

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const buildPrompt = () => {
    const typeDescriptions = {
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

    const lengthDescriptions = {
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

  const handleSave = async (textToSave = generatedText) => {
    if (!textToSave) return;
    
    setIsSaving(true);
    try {
      await GeneratedText.create({
        title: parameters.title || `Generated ${selectedType}`,
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${parameters.title || 'generated-text'}.txt`;
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
            onTypeSelect={setSelectedType}
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
              onParameterChange={handleParameterChange}
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