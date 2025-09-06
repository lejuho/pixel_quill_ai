import {
  ArrowLeft,
  FileText,
  GitBranch,
  Play,
  Plus,
  Save,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, DialogueGraph, DialogueNode } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useCallback, useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import DialogueSimulator from "../components/dialogue/DialogueSimulator";
import { Input } from "@/components/ui/input";
import NodeEditor from "../components/dialogue/NodeEditor";
import { motion } from "framer-motion";

export default function DialogueEditor() {
  const [currentGraph, setCurrentGraph] = useState(null);
  const [graphs, setGraphs] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [characters, setCharacters] = useState([]); // Added characters state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [newGraphData, setNewGraphData] = useState({
    title: "",
    description: "",
    category: "character_interaction"
  });

  const loadGraph = useCallback(async (graphId) => {
    try {
      const graphList = await DialogueGraph.filter({ id: graphId });
      const graphNodes = await DialogueNode.filter({ graph_id: graphId });
      
      if (graphList.length > 0) {
        setCurrentGraph(graphList[0]);
        setNodes(graphNodes);
      }
    } catch (error) {
      console.error("Error loading graph:", error);
    }
  }, []);

  const loadGraphs = useCallback(async () => {
    try {
      const fetchedGraphs = await DialogueGraph.list("-created_date");
      setGraphs(fetchedGraphs);
    } catch (error) {
      console.error("Error loading graphs:", error);
    }
    setIsLoading(false);
  }, []);

  // New function to load characters
  const loadCharacters = useCallback(async () => {
    try {
      const fetchedCharacters = await Character.list();
      setCharacters(fetchedCharacters);
    } catch (error) {
      console.error("Error loading characters:", error);
    }
  }, []);

  const checkUrlParams = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const graphId = urlParams.get('graph');
    if (graphId) {
      loadGraph(graphId);
    }
  }, [loadGraph]);

  useEffect(() => {
    loadGraphs();
    loadCharacters(); // Call loadCharacters on mount
    checkUrlParams();
  }, [loadGraphs, loadCharacters, checkUrlParams]); // Added loadCharacters to dependencies

  const createNewGraph = async () => {
    if (!newGraphData.title.trim()) return;

    try {
      const graph = await DialogueGraph.create(newGraphData);
      
      // Create initial start node
      const startNode = {
        graph_id: graph.id,
        node_id: `start_${Date.now()}`,
        type: 'start',
        position: { x: 100, y: 200 },
        content: 'Start',
        connections: [],
        conditions: [],
        consequences: []
      };

      const savedStartNode = await DialogueNode.create(startNode);
      
      setCurrentGraph(graph);
      setNodes([savedStartNode]);
      setGraphs(prev => [graph, ...prev]);
      setNewGraphData({ title: "", description: "", category: "character_interaction" });
    } catch (error) {
      console.error("Error creating graph:", error);
    }
  };

  const saveGraph = async () => {
    if (!currentGraph) return;

    setIsSaving(true);
    try {
      const savePromises = nodes.map(node => {
        if (node.id) {
          return DialogueNode.update(node.id, node);
        } else {
          return DialogueNode.create(node);
        }
      });

      const savedNodes = await Promise.all(savePromises);
      
      setNodes(savedNodes.map((savedNode, index) => ({
        ...nodes[index],
        id: savedNode.id || nodes[index].id
      })));

    } catch (error) {
      console.error("Error saving graph:", error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-slate-400">Loading dialogue editor...</p>
        </div>
      </div>
    );
  }

  if (!currentGraph) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Dialogue Editor
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Create branching conversations with visual node editing
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* New Graph Form */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Create New Dialogue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Dialogue title..."
                    value={newGraphData.title}
                    onChange={(e) => setNewGraphData(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Input
                    placeholder="Description (optional)..."
                    value={newGraphData.description}
                    onChange={(e) => setNewGraphData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Select 
                    value={newGraphData.category} 
                    onValueChange={(value) => setNewGraphData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="main_story" className="text-white">Main Story</SelectItem>
                      <SelectItem value="side_quest" className="text-white">Side Quest</SelectItem>
                      <SelectItem value="character_interaction" className="text-white">Character Interaction</SelectItem>
                      <SelectItem value="tutorial" className="text-white">Tutorial</SelectItem>
                      <SelectItem value="system_message" className="text-white">System Message</SelectItem>
                      <SelectItem value="other" className="text-white">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={createNewGraph}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={!newGraphData.title.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Dialogue
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Graphs */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Dialogues</CardTitle>
                </CardHeader>
                <CardContent>
                  {graphs.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {graphs.map(graph => (
                        <div
                          key={graph.id}
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                          onClick={() => loadGraph(graph.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <GitBranch className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{graph.title}</h4>
                              <p className="text-xs text-slate-400">{graph.category?.replace(/_/g, ' ')}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="text-indigo-400">
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No dialogues yet. Create your first one!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Fixed Header */}
      <div className="bg-slate-900/50 border-b border-slate-700 p-4 flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentGraph(null)}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-xl font-bold text-white">{currentGraph.title}</h1>
            <p className="text-sm text-slate-400">{currentGraph.category?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => setShowTestDialog(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>
          
          <Button
            onClick={saveGraph}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Save className="w-4 h-4 mr-2" />
              </motion.div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Node Editor - Full height minus header */}
      <div className="flex-1 relative">
        <NodeEditor
          graphId={currentGraph.id}
          nodes={nodes}
          onNodesChange={setNodes}
          onSave={saveGraph}
        />
      </div>

      {/* Test Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Dialogue</DialogTitle>
          </DialogHeader>
          <DialogueSimulator 
            nodes={nodes}
            characters={characters} // Passed characters prop
            onClose={() => setShowTestDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
