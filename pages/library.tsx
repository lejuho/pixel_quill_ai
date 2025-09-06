import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Copy,
  Download,
  Filter,
  Heart,
  Palette,
  Search,
  Trash2,
  Type
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useCallback, useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GeneratedText } from "@/entities/GeneratedText";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function Library() {
  const [texts, setTexts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGenre, setFilterGenre] = useState("all");
  const [sortBy, setSortBy] = useState("created_date");
  const [isLoading, setIsLoading] = useState(true);

  const loadTexts = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTexts = await GeneratedText.list(`-${sortBy}`);
      setTexts(fetchedTexts);
    } catch (error) {
      console.error("Error loading texts:", error);
    }
    setIsLoading(false);
  }, [sortBy]); // `sortBy` is a dependency of `loadTexts`

  useEffect(() => {
    loadTexts();
  }, [loadTexts]); // `loadTexts` is a dependency of `useEffect`

  const filteredTexts = texts.filter(text => {
    const matchesSearch = text.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         text.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || text.text_type === filterType;
    const matchesGenre = filterGenre === "all" || text.genre === filterGenre;
    
    return matchesSearch && matchesType && matchesGenre;
  });

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const handleExport = (text) => {
    const element = document.createElement("a");
    const file = new Blob([text.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${text.title || 'generated-text'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = async (id) => {
    try {
      await GeneratedText.delete(id);
      setTexts(prev => prev.filter(text => text.id !== id));
    } catch (error) {
      console.error("Error deleting text:", error);
    }
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
            Content Library
          </h1>
          <p className="text-xl text-slate-400">
            Manage and organize all your generated game content
          </p>
        </motion.div>

        {/* Filters and Search */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search your generated content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Types</SelectItem>
                    <SelectItem value="dialogue" className="text-white">Dialogue</SelectItem>
                    <SelectItem value="item_description" className="text-white">Item Description</SelectItem>
                    <SelectItem value="character_name" className="text-white">Character Names</SelectItem>
                    <SelectItem value="location_description" className="text-white">Locations</SelectItem>
                    <SelectItem value="quest_text" className="text-white">Quest Text</SelectItem>
                    <SelectItem value="lore" className="text-white">Lore</SelectItem>
                    <SelectItem value="story_snippet" className="text-white">Story Snippets</SelectItem>
                    <SelectItem value="ui_text" className="text-white">UI Text</SelectItem>
                    <SelectItem value="combat_text" className="text-white">Combat Text</SelectItem>
                    <SelectItem value="other" className="text-white">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterGenre} onValueChange={setFilterGenre}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All Genres</SelectItem>
                    <SelectItem value="fantasy" className="text-white">Fantasy</SelectItem>
                    <SelectItem value="sci_fi" className="text-white">Sci-Fi</SelectItem>
                    <SelectItem value="horror" className="text-white">Horror</SelectItem>
                    <SelectItem value="cyberpunk" className="text-white">Cyberpunk</SelectItem>
                    <SelectItem value="medieval" className="text-white">Medieval</SelectItem>
                    <SelectItem value="modern" className="text-white">Modern</SelectItem>
                    <SelectItem value="post_apocalyptic" className="text-white">Post-Apocalyptic</SelectItem>
                    <SelectItem value="steampunk" className="text-white">Steampunk</SelectItem>
                    <SelectItem value="space_opera" className="text-white">Space Opera</SelectItem>
                    <SelectItem value="mystery" className="text-white">Mystery</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="created_date" className="text-white">Newest</SelectItem>
                    <SelectItem value="title" className="text-white">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTexts.map((text, index) => (
              <motion.div
                key={text.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-lg mb-2 truncate">
                          {text.title || "Untitled"}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge 
                            className={`bg-gradient-to-r ${getTypeColor(text.text_type)} text-white border-0`}
                          >
                            <Type className="w-3 h-3 mr-1" />
                            {text.text_type?.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                            <Palette className="w-3 h-3 mr-1" />
                            {text.genre?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-slate-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(text.created_date), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700">
                      <p className="text-slate-200 text-sm leading-relaxed line-clamp-4 font-mono">
                        {text.content}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(text.content)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(text)}
                        className="text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(text.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTexts.length === 0 && !isLoading && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 text-lg">
                {searchTerm || filterType !== "all" || filterGenre !== "all" 
                  ? "No content matches your filters" 
                  : "No generated content yet"}
              </div>
              <p className="text-slate-500 mt-2">
                {searchTerm || filterType !== "all" || filterGenre !== "all"
                  ? "Try adjusting your search terms or filters"
                  : "Start generating content to see it here"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
