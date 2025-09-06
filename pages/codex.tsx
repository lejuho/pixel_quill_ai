import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Edit,
  Plus,
  Save,
  Search,
  Settings2,
  Trash2,
  Users,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character as CharacterEntity, GameVariable as GameVariableEntity, Lore as LoreEntity } from "@/entities/all";
import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- START: 타입 정의 추가 ---

// 각 데이터의 형태를 정의합니다. 실제 all.ts 파일과 일치해야 합니다.
interface Character {
  id: string;
  name: string;
  description?: string;
  personality?: string;
  voice_style?: string;
  role?: string;
  relationships?: string;
  backstory?: string;
  tags?: string[];
}

interface Lore {
  id: string;
  title: string;
  content: string;
}

interface GameVariable {
  id: string;
  name: string;
  display_name?: string;
}

// 편집 중인 아이템의 상태를 위한 타입
type EditingItem = {
  type: 'character';
  data?: Character;
} | {
  type: 'lore';
  data?: Lore;
} | {
  type: 'variable';
  data?: GameVariable;
} | null;

type CodexItemType = 'character' | 'lore' | 'variable';
type CodexItemData = Partial<Character> | Partial<Lore> | Partial<GameVariable>;

// --- END: 타입 정의 추가 ---


export default function Codex() {
  const [activeTab, setActiveTab] = useState("characters");
  // useState에 명시적으로 타입을 지정해줍니다.
  const [characters, setCharacters] = useState<Character[]>([]);
  const [lore, setLore] = useState<Lore[]>([]);
  const [variables, setVariables] = useState<GameVariable[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [charactersData, loreData, variablesData] = await Promise.all([
        CharacterEntity.list("-created_date"),
        LoreEntity.list("-created_date"),
        GameVariableEntity.list("-created_date")
      ]);
      
      setCharacters(charactersData as Character[]);
      setLore(loreData as Lore[]);
      setVariables(variablesData as GameVariable[]);
    } catch (error) {
      console.error("Error loading codex data:", error);
    }
    setIsLoading(false);
  };

  // 함수 매개변수에 타입을 지정합니다.
  const handleSave = async (type: CodexItemType, data: CodexItemData) => {
    try {
      let result: Character | Lore | GameVariable | undefined;
      // 논리 오류 수정: editingItem.id -> editingItem.data.id
      const existingItemId = editingItem?.data?.id;

      if (existingItemId) {
        // Update existing
        if (type === 'character') {
          result = await CharacterEntity.update(existingItemId, data);
          setCharacters(prev => prev.map(item => item.id === existingItemId ? { ...item, ...data } as Character : item));
        } else if (type === 'lore') {
          result = await LoreEntity.update(existingItemId, data);
          setLore(prev => prev.map(item => item.id === existingItemId ? { ...item, ...data } as Lore : item));
        } else if (type === 'variable') {
          result = await GameVariableEntity.update(existingItemId, data);
          setVariables(prev => prev.map(item => item.id === existingItemId ? { ...item, ...data } as GameVariable : item));
        }
      } else {
        // Create new
        if (type === 'character') {
          result = await CharacterEntity.create(data);
          setCharacters(prev => [result as Character, ...prev]);
        } else if (type === 'lore') {
          result = await LoreEntity.create(data);
          setLore(prev => [result as Lore, ...prev]);
        } else if (type === 'variable') {
          result = await GameVariableEntity.create(data);
          setVariables(prev => [result as GameVariable, ...prev]);
        }
      }
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  // 함수 매개변수에 타입을 지정합니다.
  const handleDelete = async (type: CodexItemType, id: string) => {
    try {
      if (type === 'character') {
        await CharacterEntity.delete(id);
        setCharacters(prev => prev.filter(item => item.id !== id));
      } else if (type === 'lore') {
        await LoreEntity.delete(id);
        setLore(prev => prev.filter(item => item.id !== id));
      } else if (type === 'variable') {
        await GameVariableEntity.delete(id);
        setVariables(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const CharacterEditor = ({ character }: { character?: Character }) => {
    const [formData, setFormData] = useState<Partial<Character>>(character || {
      name: "",
      description: "",
      personality: "",
      voice_style: "",
      role: "other",
      relationships: "",
      backstory: "",
      tags: []
    });

    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            {character ? "Edit Character" : "New Character"}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingItem(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Character name"
              value={formData.name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
            
            <Select 
              value={formData.role || 'other'} 
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="protagonist" className="text-white">Protagonist</SelectItem>
                <SelectItem value="antagonist" className="text-white">Antagonist</SelectItem>
                <SelectItem value="ally" className="text-white">Ally</SelectItem>
                <SelectItem value="neutral" className="text-white">Neutral</SelectItem>
                <SelectItem value="merchant" className="text-white">Merchant</SelectItem>
                <SelectItem value="guard" className="text-white">Guard</SelectItem>
                <SelectItem value="quest_giver" className="text-white">Quest Giver</SelectItem>
                <SelectItem value="other" className="text-white">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Physical description and background"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />

          <Textarea
            placeholder="Personality traits and quirks"
            value={formData.personality || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />

          <Textarea
            placeholder="How the character speaks and their speech patterns"
            value={formData.voice_style || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, voice_style: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />

          <Textarea
            placeholder="Character's history and motivations"
            value={formData.backstory || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, backstory: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white"
          />

          <Button
            onClick={() => handleSave('character', formData)}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={!formData.name || !formData.personality || !formData.voice_style}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Character
          </Button>
        </CardContent>
      </Card>
    );
  };

  const filteredCharacters = characters.filter(char => 
    char.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLore = lore.filter(entry => 
    entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVariables = variables.filter(variable => 
    variable.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Codex
          </h1>
          <p className="text-xl text-slate-400">
            Manage characters, lore, and game variables for consistent AI generation
          </p>
        </motion.div>

        {/* Search Bar */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search your codex..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="characters" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Characters ({characters.length})
            </TabsTrigger>
            <TabsTrigger value="lore" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Lore ({lore.length})
            </TabsTrigger>
            <TabsTrigger value="variables" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Settings2 className="w-4 h-4 mr-2" />
              Variables ({variables.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Characters</h2>
              <Button
                onClick={() => setEditingItem({ type: 'character' })}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Character
              </Button>
            </div>

            {editingItem?.type === 'character' && (
              <CharacterEditor character={editingItem.data} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredCharacters.map(character => (
                  <motion.div
                    key={character.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-white">{character.name}</CardTitle>
                            <Badge className="mt-2 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                              {character.role?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingItem({ type: 'character', data: character })}
                              className="text-slate-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete('character', character.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                          {character.description || character.personality}
                        </p>
                        {character.voice_style && (
                          <p className="text-slate-500 text-xs italic">
                            Voice: {character.voice_style}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredCharacters.length === 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-xl font-semibold text-white mb-2">No characters yet</h3>
                  <p className="text-slate-400 mb-6">
                    Create characters to use in your dialogues and maintain narrative consistency
                  </p>
                  <Button
                    onClick={() => setEditingItem({ type: 'character' })}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Character
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lore" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Lore</h2>
              <Button
                onClick={() => setEditingItem({ type: 'lore' })}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lore
              </Button>
            </div>

            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Lore management coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Game Variables</h2>
              <Button
                onClick={() => setEditingItem({ type: 'variable' })}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </div>

            <div className="text-center py-12 text-slate-400">
              <Settings2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Variables management coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

