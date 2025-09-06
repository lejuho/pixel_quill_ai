import {
  ArrowRight,
  Clock,
  FileText,
  Sparkles,
  Star,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Template } from "@/entities/Template";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const fetchedTemplates = await Template.list("-is_popular");
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
    setIsLoading(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      dialogue: "from-blue-400 to-blue-600",
      item_description: "from-purple-400 to-purple-600",
      character_name: "from-green-400 to-green-600",
      location_description: "from-orange-400 to-orange-600",
      quest_text: "from-red-400 to-red-600",
      lore: "from-indigo-400 to-indigo-600",
      story_snippet: "from-pink-400 to-pink-600",
      ui_text: "from-cyan-400 to-cyan-600",
      combat_text: "from-yellow-400 to-yellow-600",
      other: "from-gray-400 to-gray-600"
    };
    return colors[type] || colors.other;
  };

  if (templates.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Content Templates
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Quick-start templates for common game text generation
            </p>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-4">
                  Templates Coming Soon!
                </h3>
                <p className="text-slate-400 mb-6">
                  We're working on creating awesome templates to make your content generation even easier.
                </p>
                <Link to={createPageUrl("Generator")}>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Start Generating Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Content Templates
          </h1>
          <p className="text-xl text-slate-400">
            Quick-start templates for common game content generation
          </p>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 h-full group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-white text-lg">
                          {template.name}
                        </CardTitle>
                        {template.is_popular && (
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge 
                          className={`bg-gradient-to-r ${getTypeColor(template.text_type)} text-white border-0`}
                        >
                          {template.text_type?.replace(/_/g, ' ')}
                        </Badge>
                        
                        {template.suggested_genre && (
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                            {template.suggested_genre?.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700">
                    <p className="text-slate-300 text-xs font-mono leading-relaxed line-clamp-3">
                      {template.prompt_template}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Quick setup
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Optimized
                      </span>
                    </div>
                    
                    <Link to={createPageUrl("Generator")}>
                      <Button 
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300"
                      >
                        Use Template
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}