import {
  Box,
  Check,
  Copy,
  Download,
  FileCode,
  Gamepad2,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, DialogueGraph, DialogueNode, GameVariable, Lore } from "@/entities/all";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

export default function Export() {
  const [graphs, setGraphs] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [exportData, setExportData] = useState(null);
  const [exportFormat, setExportFormat] = useState("unity");
  const [selectedGraphs, setSelectedGraphs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [graphsData, charactersData] = await Promise.all([
        DialogueGraph.list("-created_date"),
        Character.list()
      ]);
      
      setGraphs(graphsData);
      setCharacters(charactersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const generateUnityFormat = async (graphIds) => {
    const exportObject = {
      metadata: {
        generator: "NarrativeAI Engine",
        version: "1.0",
        export_date: new Date().toISOString(),
        format: "unity"
      },
      characters: {},
      dialogues: {}
    };

    // Add characters
    characters.forEach(character => {
      exportObject.characters[character.id] = {
        name: character.name,
        description: character.description,
        personality: character.personality,
        voice_style: character.voice_style,
        role: character.role
      };
    });

    // Add selected dialogue graphs with their nodes
    for (const graphId of graphIds) {
      const graph = graphs.find(g => g.id === graphId);
      const nodes = await DialogueNode.filter({ graph_id: graphId });
      
      exportObject.dialogues[graphId] = {
        title: graph.title,
        description: graph.description,
        category: graph.category,
        nodes: {}
      };

      nodes.forEach(node => {
        exportObject.dialogues[graphId].nodes[node.node_id] = {
          type: node.type,
          character_id: node.character_id,
          content: node.content,
          connections: node.connections || [],
          conditions: node.conditions || [],
          consequences: node.consequences || [],
          position: node.position,
          choices: node.choices || []
        };
      });
    }

    return exportObject;
  };

  const generateGodotFormat = async (graphIds) => {
    const exportObject = {
      metadata: {
        generator: "NarrativeAI Engine",
        version: "1.0",
        export_date: new Date().toISOString(),
        format: "godot"
      },
      characters: {},
      dialogues: {}
    };

    // Add characters
    characters.forEach(character => {
      exportObject.characters[character.id] = {
        name: character.name,
        description: character.description,
        personality: character.personality,
        voice_style: character.voice_style,
        role: character.role
      };
    });

    // Add dialogue graphs in Godot format
    for (const graphId of graphIds) {
      const graph = graphs.find(g => g.id === graphId);
      const nodes = await DialogueNode.filter({ graph_id: graphId });
      
      exportObject.dialogues[graphId] = {
        title: graph.title,
        description: graph.description,
        category: graph.category,
        nodes: {}
      };

      nodes.forEach(node => {
        const godotNode = {
          type: node.type,
          character_id: node.character_id,
          content: node.content,
          next_id: node.connections?.[0] || null,
          conditions: node.conditions || [],
          consequences: node.consequences || []
        };

        // For choice nodes, convert to Godot format
        if (node.type === 'choice') {
          godotNode.choices = node.choices?.map((choice, index) => ({
            text: choice,
            next_id: node.connections?.[index] || null
          })) || [];
          delete godotNode.next_id; // Choices handle their own connections
        }

        exportObject.dialogues[graphId].nodes[node.node_id] = godotNode;
      });
    }

    return exportObject;
  };

  const generateExport = async () => {
    if (selectedGraphs.length === 0) return;

    setIsGenerating(true);
    try {
      let exportObject;
      
      if (exportFormat === "unity") {
        exportObject = await generateUnityFormat(selectedGraphs);
      } else {
        exportObject = await generateGodotFormat(selectedGraphs);
      }

      setExportData(JSON.stringify(exportObject, null, 2));
    } catch (error) {
      console.error("Error generating export:", error);
    }
    setIsGenerating(false);
  };

  const downloadExport = () => {
    if (!exportData) return;

    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `narrative-export-${exportFormat}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!exportData) return;
    
    try {
      await navigator.clipboard.writeText(exportData);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const toggleGraphSelection = (graphId) => {
    setSelectedGraphs(prev => 
      prev.includes(graphId)
        ? prev.filter(id => id !== graphId)
        : [...prev, graphId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Export Project
          </h1>
          <p className="text-xl text-slate-400">
            Export your dialogues as structured JSON for Unity, Godot, and other game engines
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Configuration */}
          <div className="space-y-6">
            {/* Format Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  Export Format
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    exportFormat === 'unity' 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setExportFormat('unity')}
                >
                  <div className="flex items-center gap-3">
                    <Box className="w-8 h-8 text-indigo-400" />
                    <div>
                      <h3 className="text-white font-medium">Unity Format</h3>
                      <p className="text-slate-400 text-sm">Optimized for Unity dialogue systems</p>
                    </div>
                    {exportFormat === 'unity' && <Check className="w-5 h-5 text-indigo-400 ml-auto" />}
                  </div>
                </div>

                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    exportFormat === 'godot' 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setExportFormat('godot')}
                >
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-white font-medium">Godot Format</h3>
                      <p className="text-slate-400 text-sm">Compatible with Godot dialogue addons</p>
                    </div>
                    {exportFormat === 'godot' && <Check className="w-5 h-5 text-indigo-400 ml-auto" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dialogue Selection */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Select Dialogues to Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {graphs.map(graph => (
                  <div
                    key={graph.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedGraphs.includes(graph.id)
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => toggleGraphSelection(graph.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{graph.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                            {graph.category?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      {selectedGraphs.includes(graph.id) && (
                        <Check className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                  </div>
                ))}

                {graphs.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <FileCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No dialogues available for export</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateExport}
              disabled={selectedGraphs.length === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-3"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Generating Export...
                </>
              ) : (
                <>
                  <FileCode className="w-5 h-5 mr-2" />
                  Generate Export ({selectedGraphs.length} dialogue{selectedGraphs.length !== 1 ? 's' : ''})
                </>
              )}
            </Button>
          </div>

          {/* Export Preview */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Export Preview</CardTitle>
                  {exportData && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="border-slate-600 text-slate-300"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={downloadExport}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {exportData ? (
                  <Textarea
                    value={exportData}
                    readOnly
                    className="bg-slate-900/50 border-slate-600 text-slate-200 font-mono text-sm min-h-[500px] resize-none"
                  />
                ) : (
                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-8 text-center">
                    <FileCode className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400 mb-2">Export preview will appear here</p>
                    <p className="text-slate-500 text-sm">Select dialogues and click generate to preview your export</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Integration Guide */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Integration Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 space-y-2">
                <p><strong className="text-slate-300">Unity Format:</strong> Uses connections array for each node. Parse dialogue trees by following the connections from start node.</p>
                <p><strong className="text-slate-300">Godot Format:</strong> Uses next_id for linear progression and choices array for branching. Compatible with popular dialogue addons.</p>
                <p><strong className="text-slate-300">Characters:</strong> All character data including personality and voice style for AI-consistent dialogue generation.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}