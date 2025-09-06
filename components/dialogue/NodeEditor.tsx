import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, GameVariable } from "../../entities/all";
import {
  GitBranch,
  MessageSquare,
  Plus,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Wand2,
  X
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import DialogueNodeComponent from "./DialogueNode";
import { Input } from "@/components/ui/input";
import { InvokeLLM } from "../../integrations/Core";
import { Textarea } from "@/components/ui/textarea";

// --- TypeScript 타입 정의 시작 ---

interface Condition {
  variable: string;
  operator: string;
  value: string;
}

interface NodeData {
  graph_id: string;
  node_id: string;
  type: 'dialogue' | 'choice' | 'condition' | 'action' | 'start' | 'end';
  position: { x: number; y: number };
  content?: string;
  character_id?: string;
  connections?: string[];
  conditions?: Condition[];
  consequences?: any[]; // 필요에 따라 더 구체적인 타입으로 변경
  choices?: string[];
}

interface CharacterData {
  id: string;
  name: string;
  personality?: string;
  voice_style?: string;
  role?: string;
  backstory?: string;
}

interface VariableData {
  id: string;
  name: string;
  display_name?: string;
}

interface NodeEditorProps {
  graphId: string;
  nodes: NodeData[];
  onNodesChange: (nodes: NodeData[]) => void;
  onSave: () => void;
}

interface ConnectionStart {
  nodeId: string;
  x: number;
  y: number;
  outputIndex: number;
}

// --- TypeScript 타입 정의 끝 ---

export default function NodeEditor({
  graphId,
  nodes = [],
  onNodesChange,
  onSave
}: NodeEditorProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [variables, setVariables] = useState<VariableData[]>([]);
  const [connectionStart, setConnectionStart] = useState<ConnectionStart | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x1: number; y1: number; x2: number; y2: number; } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCharacters();
    loadVariables();
  }, []);

  const loadCharacters = async () => {
    try {
      const fetchedCharacters = await Character.list();
      setCharacters(fetchedCharacters);
    } catch (error) {
      console.error("Error loading characters:", error);
    }
  };

  const loadVariables = async () => {
    try {
      const fetchedVariables = await GameVariable.list();
      setVariables(fetchedVariables);
    } catch (error) {
      console.error("Error loading variables:", error);
    }
  };

  const getCharacterById = (characterId?: string): CharacterData | undefined => {
    if (!characterId) return undefined;
    return characters.find(c => c.id === characterId);
  };

  const createNode = useCallback((type: NodeData['type']) => {
    const rect = editorRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.width / 2 - 128 : 300;
    const centerY = rect ? rect.height / 2 - 80 : 300;

    let x = centerX + (Math.random() - 0.5) * 200;
    let y = centerY + (Math.random() - 0.5) * 200;

    x = Math.max(50, Math.min(x, (rect?.width || 800) - 300));
    y = Math.max(50, Math.min(y, (rect?.height || 600) - 200));

    const nodeId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newNode: NodeData = {
      graph_id: graphId,
      node_id: nodeId,
      type,
      position: { x, y },
      content: type === 'start' ? 'Start' : type === 'end' ? 'End' : '',
      connections: [],
      conditions: [],
      consequences: [],
      choices: type === 'choice' ? [''] : undefined,
      character_id: type === 'dialogue' ? '' : undefined,
    };

    const updatedNodes = [...nodes, newNode];
    onNodesChange(updatedNodes);
    setSelectedNode(nodeId);
    return newNode;
  }, [nodes, onNodesChange, graphId]);

  const updateNode = useCallback((nodeId: string, updates: Partial<NodeData>) => {
    const updatedNodes = nodes.map(node =>
      node.node_id === nodeId ? { ...node, ...updates } : node
    );
    onNodesChange(updatedNodes);
  }, [nodes, onNodesChange]);

  const deleteNode = useCallback((nodeId: string) => {
    const updatedNodes = nodes
      .filter(node => node.node_id !== nodeId)
      .map(node => ({
        ...node,
        connections: node.connections?.filter(connId => connId !== nodeId) || []
      }));

    onNodesChange(updatedNodes);
    setSelectedNode(null);
  }, [nodes, onNodesChange]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, node: NodeData) => {
    if ((e.target as HTMLElement).closest('.connection-handle')) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = editorRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggedNode(node.node_id);
    setDragOffset({
      x: e.clientX - rect.left - (node.position?.x || 0),
      y: e.clientY - rect.top - (node.position?.y || 0)
    });
    setSelectedNode(node.node_id);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedNode && editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      updateNode(draggedNode, {
        position: { x: Math.max(0, x), y: Math.max(0, y) }
      });
    }

    if (isConnecting && connectionStart && editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      setTempConnection({
        x1: connectionStart.x - rect.left,
        y1: connectionStart.y - rect.top,
        x2: e.clientX - rect.left,
        y2: e.clientY - rect.top
      });
    }
  }, [draggedNode, dragOffset, updateNode, isConnecting, connectionStart]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    if (isConnecting) {
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnection(null);
    }
  }, [isConnecting]);

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    if (e.target === editorRef.current) {
      setSelectedNode(null);
    }
  }, []);

  const startConnection = useCallback((nodeId: string, position: { x: number, y: number }, outputIndex = 0) => {
    setConnectionStart({ nodeId, x: position.x, y: position.y, outputIndex });
    setIsConnecting(true);
  }, []);

  const completeConnection = useCallback((targetNodeId: string) => {
    if (connectionStart && connectionStart.nodeId !== targetNodeId) {
      const sourceNode = nodes.find(n => n.node_id === connectionStart.nodeId);
      if (sourceNode) {
        const connections = sourceNode.connections || [];
        // Prevent duplicate connections
        if (!connections.includes(targetNodeId)) {
            const newConnections = [...connections];
            // For choice and condition nodes, connections are index-based
            if(sourceNode.type === 'choice' || sourceNode.type === 'condition') {
                newConnections[connectionStart.outputIndex] = targetNodeId;
            } else {
                newConnections.push(targetNodeId);
            }
            updateNode(connectionStart.nodeId, { connections: newConnections });
        }
      }
    }
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnection(null);
  }, [connectionStart, nodes, updateNode]);

  const generateAIDialogue = async (selectedNodeData: NodeData) => {
    const character = getCharacterById(selectedNodeData.character_id);
    if (!character) {
      alert("Please select a character first");
      return;
    }

    setIsGeneratingAI(true);
    setAiSuggestions([]);

    try {
      // Find previous node content for context
      const previousNode = nodes.find(node =>
        node.connections?.includes(selectedNodeData.node_id)
      );

      let prompt = `Generate dialogue for a character named ${character.name}.

Character Details:
- Personality: ${character.personality}
- Voice Style: ${character.voice_style}
- Role: ${character.role}
${character.backstory ? `- Backstory: ${character.backstory}` : ''}

${previousNode ? `Previous dialogue context: "${previousNode.content}"` : ''}

Generate 4 different dialogue options that this character might say. Each should be 1-2 sentences and match their personality and voice style. Return them as a simple list.`;

      const result = await InvokeLLM({ prompt });

      // Parse the result into suggestions
      const suggestions = result.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 4);

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("Error generating AI dialogue:", error);
      alert("Failed to generate AI dialogue. Please try again.");
    }
    setIsGeneratingAI(false);
  };

  useEffect(() => {
    if (draggedNode || isConnecting) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = () => handleMouseUp();

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggedNode, isConnecting, handleMouseMove, handleMouseUp]);

  const nodeTypes = [
    { type: 'dialogue', icon: MessageSquare, label: 'Dialogue' },
    { type: 'choice', icon: GitBranch, label: 'Choice' },
    { type: 'condition', icon: Settings, label: 'Condition' },
    { type: 'action', icon: Settings, label: 'Action' }
  ];

  const selectedNodeData = selectedNode ? nodes.find(n => n.node_id === selectedNode) : null;

  const NodeEditPanel = () => {
    const [editData, setEditData] = useState<Partial<NodeData>>(selectedNodeData || {});

    useEffect(() => {
      setEditData(selectedNodeData || {});
    }, [selectedNodeData]);

    const handleSaveEdit = () => {
      if (selectedNode) {
        updateNode(selectedNode, editData);
      }
    };
    
    const addChoice = () => {
      const choices = editData.choices || [];
      setEditData(prev => ({ ...prev, choices: [...choices, ''] }));
    };
  
    const updateChoice = (index: number, value: string) => {
      const choices = [...(editData.choices || [])];
      choices[index] = value;
      setEditData(prev => ({ ...prev, choices }));
    };
  
    const removeChoice = (index: number) => {
      const choices = [...(editData.choices || [])];
      if (choices.length > 1) {
        choices.splice(index, 1);
        setEditData(prev => ({ ...prev, choices }));
      }
    };
  
    const addCondition = () => {
      const conditions = editData.conditions || [];
      setEditData(prev => ({
        ...prev,
        conditions: [...conditions, { variable: '', operator: '==', value: '' }]
      }));
    };
  
    const updateCondition = (index: number, field: keyof Condition, value: string) => {
      const conditions = [...(editData.conditions || [])];
      conditions[index] = { ...conditions[index], [field]: value };
      setEditData(prev => ({ ...prev, conditions }));
    };
  
    const removeCondition = (index: number) => {
      const conditions = [...(editData.conditions || [])];
      conditions.splice(index, 1);
      setEditData(prev => ({ ...prev, conditions: [...conditions] }));
    };


    if (!selectedNodeData || selectedNodeData.type === 'start' || selectedNodeData.type === 'end') {
      return (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center text-slate-400">
            {selectedNodeData ? 'System nodes cannot be edited' : 'Select a node to edit its properties'}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center justify-between">
            Edit {selectedNodeData.type} Node
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedNode(null)}
              className="w-6 h-6 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {/* Dialogue Node Editing */}
          {selectedNodeData.type === 'dialogue' && (
            <>
              <div>
                <label className="text-slate-300 text-sm mb-2 block">Character</label>
                <Select
                  value={editData.character_id || ''}
                  onValueChange={(value : string) => setEditData(prev => ({ ...prev, character_id: value }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select character" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {characters.map(character => (
                      <SelectItem key={character.id} value={character.id} className="text-white">
                        {character.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-300 text-sm">Dialogue Text</label>
                  <Button
                    size="sm"
                    onClick={() => generateAIDialogue(editData as NodeData)}
                    disabled={isGeneratingAI || !editData.character_id}
                    className="bg-purple-600 hover:bg-purple-700 text-xs"
                  >
                    {isGeneratingAI ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                      </motion.div>
                    ) : (
                      <Wand2 className="w-3 h-3 mr-1" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  placeholder="What does the character say?"
                  value={editData.content || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />

                {/* AI Suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <label className="text-slate-300 text-xs">AI Suggestions:</label>
                    {aiSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 bg-slate-700 rounded border cursor-pointer hover:bg-slate-600 transition-colors"
                        onClick={() => setEditData(prev => ({ ...prev, content: suggestion }))}
                      >
                        <p className="text-slate-200 text-sm">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Choice Node Editing */}
          {selectedNodeData.type === 'choice' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-300 text-sm">Player Choices</label>
                <Button
                  size="sm"
                  onClick={addChoice}
                  className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Choice
                </Button>
              </div>

              <Input
                placeholder="Choice prompt (optional)"
                value={editData.content || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 mb-3"
              />

              {(editData.choices || ['']).map((choice, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder={`Choice ${index + 1}`}
                    value={choice}
                    onChange={(e) => updateChoice(index, e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                  {(editData.choices?.length || 0) > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChoice(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Condition Node Editing */}
          {selectedNodeData.type === 'condition' && (
            <div>
              <Input
                placeholder="Condition description"
                value={editData.content || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 mb-3"
              />

              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-300 text-sm">Conditions</label>
                <Button
                  size="sm"
                  onClick={addCondition}
                  className="bg-yellow-600 hover:bg-yellow-700 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Condition
                </Button>
              </div>

              {(editData.conditions || []).map((condition, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2 items-center">
                  <Select
                    value={condition.variable || ''}
                    onValueChange={(value:string) => updateCondition(index, 'variable', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Variable" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {variables.map(variable => (
                        <SelectItem key={variable.id} value={variable.name} className="text-white">
                          {variable.display_name || variable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator || '=='}
                    onValueChange={(value:string) => updateCondition(index, 'operator', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="==" className="text-white">Equals</SelectItem>
                      <SelectItem value="!=" className="text-white">Not Equals</SelectItem>
                      <SelectItem value=">" className="text-white">Greater Than</SelectItem>
                      <SelectItem value="<" className="text-white">Less Than</SelectItem>
                      <SelectItem value=">=" className="text-white">Greater or Equal</SelectItem>
                      <SelectItem value="<=" className="text-white">Less or Equal</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1 items-center">
                    <Input
                      placeholder="Value"
                      value={condition.value || ''}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCondition(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Node Editing */}
          {selectedNodeData.type === 'action' && (
            <div>
              <Input
                placeholder="Action description"
                value={editData.content || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 mb-3"
              />
              <div className="text-center py-4 text-slate-400 text-sm">
                Action consequences editing coming soon...
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveEdit}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>

          
            <Button
              variant="destructive"
              onClick={() => deleteNode(selectedNodeData.node_id)}
              className="w-full"
            >
              Delete Node
            </Button>
          
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-slate-900/50 border-r border-slate-700 flex flex-col">
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Add Nodes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nodeTypes.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                  onClick={() => createNode(type as NodeData['type'])}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={onSave}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Graph
              </Button>
            </CardContent>
          </Card>

          <NodeEditPanel />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={editorRef}
          className="w-full h-full node-editor bg-slate-950 relative"
          onClick={handleEditorClick}
          style={{
            minHeight: '100vh',
            minWidth: '200%',
            cursor: draggedNode ? 'grabbing' : isConnecting ? 'crosshair' : 'default'
          }}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgb(71, 85, 105)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            {/* Existing connections */}
            {nodes.map(sourceNode =>
                sourceNode.connections?.map((targetId, outputIndex) => {
                    const targetNode = nodes.find(n => n.node_id === targetId);
                    if (!sourceNode.position || !targetNode || !targetNode.position) return null;

                    let sourceX = sourceNode.position.x + 256;
                    let sourceY = sourceNode.position.y + 60; // Default center
                    
                    if (sourceNode.type === 'choice') {
                        sourceY = sourceNode.position.y + 20 + (outputIndex * 30);
                    } else if (sourceNode.type === 'condition') {
                        sourceY = sourceNode.position.y + (outputIndex === 0 ? 30 : 60);
                    }

                    const targetX = targetNode.position.x;
                    const targetY = targetNode.position.y + 60;

                    const midX = (sourceX + targetX) / 2;
                    const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
                    
                    return (
                        <path
                            key={`${sourceNode.node_id}-${targetId}-${outputIndex}`}
                            d={path}
                            stroke="rgb(99, 102, 241)"
                            strokeWidth="2"
                            fill="none"
                            className="opacity-80"
                            markerEnd="url(#arrowhead)"
                        />
                    );
                })
            )}

            {/* Temporary connection line */}
            {tempConnection && (
              <line
                x1={tempConnection.x1}
                y1={tempConnection.y1}
                x2={tempConnection.x2}
                y2={tempConnection.y2}
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="opacity-60"
              />
            )}

            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="rgb(99, 102, 241)"
                />
              </marker>
            </defs>
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map(node => (
              <DialogueNodeComponent
                key={node.node_id}
                node={node}
                character={getCharacterById(node.character_id)}
                choices={node.choices || []}
                isSelected={selectedNode === node.node_id}
                isDragging={draggedNode === node.node_id}
                isConnecting={isConnecting}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onStartConnection={startConnection}
                onCompleteConnection={completeConnection}
                onEdit={() => setSelectedNode(node.node_id)}
              />
            ))}
          </AnimatePresence>

          {/* Instructions */}
          {nodes.length <= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 pointer-events-none"
            >
              <Card className="bg-slate-800/90 border-slate-700 p-6">
                <CardContent>
                  <h3 className="text-white font-medium mb-2">Ready to build your dialogue!</h3>
                  <p className="text-slate-400 text-sm">
                    Add dialogue nodes from the left panel and connect them by dragging from the output handles (right side) to input handles (left side).
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

