import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  Play,
  RotateCcw,
  Settings,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DialogueSimulator({ nodes, characters, onClose }) {
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Find start node
    const startNode = nodes.find(node => node.type === 'start');
    if (startNode) {
      setCurrentNodeId(startNode.node_id);
      setIsSimulating(true);
    }
  }, [nodes]);

  const getCurrentNode = () => {
    return nodes.find(node => node.node_id === currentNodeId);
  };

  const getCharacterById = (characterId) => {
    return characters.find(c => c.id === characterId);
  };

  const getNextNode = (connectionIndex = 0) => {
    const currentNode = getCurrentNode();
    if (!currentNode || !currentNode.connections) return null;
    
    const nextNodeId = currentNode.connections[connectionIndex];
    return nodes.find(node => node.node_id === nextNodeId);
  };

  const handleChoice = (choiceIndex) => {
    const currentNode = getCurrentNode();
    if (!currentNode) return;

    // Add current dialogue to history
    setDialogueHistory(prev => [...prev, {
      type: 'choice',
      content: currentNode.choices?.[choiceIndex] || `Choice ${choiceIndex + 1}`,
      speaker: 'Player'
    }]);

    // Move to next node
    const nextNodeId = currentNode.connections?.[choiceIndex];
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
    } else {
      setIsSimulating(false);
    }
  };

  const handleContinue = () => {
    const currentNode = getCurrentNode();
    if (!currentNode) return;

    // Add current dialogue to history
    if (currentNode.type === 'dialogue') {
      const character = getCharacterById(currentNode.character_id);
      setDialogueHistory(prev => [...prev, {
        type: 'dialogue',
        content: currentNode.content,
        speaker: character?.name || 'Unknown'
      }]);
    }

    // Move to next node
    const nextNodeId = currentNode.connections?.[0];
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
    } else {
      setIsSimulating(false);
    }
  };

  const reset = () => {
    const startNode = nodes.find(node => node.type === 'start');
    if (startNode) {
      setCurrentNodeId(startNode.node_id);
      setDialogueHistory([]);
      setIsSimulating(true);
    }
  };

  const currentNode = getCurrentNode();

  if (!currentNode) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-white text-lg mb-4">No start node found</h3>
        <p className="text-slate-400 mb-4">Your dialogue graph needs a start node to begin testing.</p>
        <Button onClick={onClose} variant="outline" className="border-slate-600 text-slate-300">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg">Dialogue Test</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={reset}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={onClose}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Dialogue History */}
      {dialogueHistory.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Conversation History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-32 overflow-y-auto">
            {dialogueHistory.map((entry, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Badge 
                  variant={entry.type === 'dialogue' ? 'default' : 'secondary'}
                  className="mt-0.5"
                >
                  {entry.speaker}
                </Badge>
                <p className="text-slate-300 flex-1">{entry.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Node Display */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          {currentNode.type === 'start' && (
            <div className="text-center py-4">
              <Play className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h4 className="text-white font-medium mb-2">Conversation Start</h4>
              <Button
                onClick={handleContinue}
                className="bg-green-600 hover:bg-green-700"
              >
                Begin Dialogue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {currentNode.type === 'dialogue' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">
                  {getCharacterById(currentNode.character_id)?.name || 'Unknown Character'}
                </span>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-200 leading-relaxed">
                  {currentNode.content || 'No dialogue text'}
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {currentNode.type === 'choice' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Player Choice</span>
              </div>
              
              {currentNode.content && (
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4">
                  <p className="text-slate-200 leading-relaxed">{currentNode.content}</p>
                </div>
              )}

              <div className="space-y-2">
                {currentNode.choices?.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(index)}
                    variant="outline"
                    className="w-full text-left justify-start border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-purple-500"
                  >
                    {index + 1}. {choice}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {currentNode.type === 'end' && (
            <div className="text-center py-4">
              <h4 className="text-white font-medium mb-2">Conversation End</h4>
              <p className="text-slate-400 mb-4">The dialogue has concluded.</p>
              <Button
                onClick={reset}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          )}

          {(currentNode.type === 'condition' || currentNode.type === 'action') && (
            <div className="text-center py-4">
              <Settings className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
              <h4 className="text-white font-medium mb-2">
                {currentNode.type === 'condition' ? 'Condition Check' : 'Action Executed'}
              </h4>
              <p className="text-slate-400 mb-4">
                {currentNode.content || `${currentNode.type} node - continuing automatically`}
              </p>
              <Button
                onClick={handleContinue}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!isSimulating && currentNode.type !== 'end' && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <h4 className="text-red-300 font-medium mb-2">Dead End</h4>
            <p className="text-red-400 text-sm">This node has no connections. Connect it to continue the dialogue.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
