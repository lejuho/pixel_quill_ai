import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Copy,
  Download,
  Edit3,
  Heart,
  RefreshCw,
  Save,
  Sparkles
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { Textarea } from "@/components/ui/textarea";

export default function GeneratedTextDisplay({ 
  generatedText,
  title,
  onTitleChange,
  isGenerating,
  onRegenerate,
  onSave,
  onCopy,
  onExport,
  isSaving,
  showSaveSuccess
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState(generatedText);

  React.useEffect(() => {
    setEditedText(generatedText);
  }, [generatedText]);

  const handleSave = () => {
    onSave(editedText);
    setIsEditing(false);
  };

  return (
    <AnimatePresence mode="wait">
      {(generatedText || isGenerating) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Generated Content</h3>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              Step 3
            </Badge>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="border-b border-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Your Generated Text
                </CardTitle>
                <div className="flex items-center gap-2">
                  {showSaveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 text-green-400 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Saved!
                    </motion.div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Title Input */}
              <div className="pt-2">
                <Input 
                  placeholder="Enter a title for this text..."
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-purple-400">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                    <span className="text-lg">Generating amazing content...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white min-h-[200px] font-mono text-sm leading-relaxed"
                    />
                  ) : (
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                        {generatedText}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedText(generatedText);
                          }}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => onSave(generatedText)}
                          disabled={isSaving}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {isSaving ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                            </motion.div>
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save to Library
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={onCopy}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={onRegenerate}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={onExport}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}