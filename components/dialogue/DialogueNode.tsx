import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Circle,
  GitBranch,
  MessageSquare,
  Play,
  Settings,
  Square,
  User,
  X,
  XCircle
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";
import { motion } from "framer-motion";

// --- TypeScript 타입 정의 시작 ---

// Node 객체의 구조를 정의합니다.
interface DialogueNodeData {
  node_id: string;
  type: 'start' | 'dialogue' | 'choice' | 'condition' | 'action' | 'end';
  content?: string;
  position?: { x: number; y: number };
  connections?: any[]; // 필요에 따라 더 구체적인 타입으로 변경 가능
  conditions?: any[];  // 필요에 따라 더 구체적인 타입으로 변경 가능
  consequences?: any[];// 필요에 따라 더 구체적인 타입으로 변경 가능
}

// Character 객체의 구조를 정의합니다.
interface CharacterData {
  name: string;
}

// DialogueNode 컴포넌트가 받는 props의 타입을 정의합니다.
interface DialogueNodeProps {
  node: DialogueNodeData;
  character?: CharacterData;
  choices?: string[];
  isSelected: boolean;
  isDragging: boolean;
  isConnecting: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onStartConnection: (nodeId: string, position: { x: number; y: number }, outputIndex: number) => void;
  onCompleteConnection: (nodeId: string) => void;
  onEdit: () => void;
}

// --- TypeScript 타입 정의 끝 ---

const nodeIcons = {
  start: Play,
  dialogue: MessageSquare,
  choice: GitBranch,
  condition: Settings,
  action: Settings,
  end: Square
};

const nodeColors = {
  start: "from-green-500 to-emerald-500",
  dialogue: "from-blue-500 to-cyan-500",
  choice: "from-purple-500 to-violet-500",
  condition: "from-yellow-500 to-amber-500",
  action: "from-orange-500 to-red-500",
  end: "from-gray-500 to-slate-500"
};

export default function DialogueNode({
  node,
  character,
  choices = [],
  isSelected,
  isDragging,
  isConnecting,
  onMouseDown,
  onStartConnection,
  onCompleteConnection,
  onEdit
}: DialogueNodeProps) { // props에 타입을 적용합니다.
  const Icon = nodeIcons[node.type] || MessageSquare;

  const handleConnectionStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, outputIndex = 0) => {
    e.preventDefault();
    e.stopPropagation();

    const nodeElement = e.currentTarget.closest('.dialogue-node');
    if (!nodeElement) return;
    
    const handleRect = e.currentTarget.getBoundingClientRect();

    onStartConnection(node.node_id, {
      x: handleRect.left + handleRect.width / 2,
      y: handleRect.top + handleRect.height / 2
    }, outputIndex);
  };

  const handleConnectionEnd = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isConnecting) {
      onCompleteConnection(node.node_id);
    }
  };

  const getDisplayContent = () => {
    if (node.type === 'start') return "Conversation Start";
    if (node.type === 'end') return "Conversation End";
    if (node.type === 'choice') return node.content || "Player Choice";
    if (!node.content) return `Click to edit ${node.type}`;

    const maxLength = 50;
    return node.content.length > maxLength
      ? node.content.substring(0, maxLength) + "..."
      : node.content;
  };

  const canDelete = node.type !== 'start' && node.type !== 'end';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isDragging ? 1.05 : 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      style={{
        position: 'absolute',
        left: node.position?.x || 0,
        top: node.position?.y || 0,
        zIndex: isSelected ? 20 : isDragging ? 30 : 10,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="dialogue-node"
      onMouseDown={onMouseDown}
    >
      <Card
        className={`w-64 transition-all duration-200 border-2 select-none ${
          isSelected
            ? 'border-indigo-400 shadow-lg shadow-indigo-500/20'
            : 'border-slate-700 hover:border-slate-600'
        } ${
          node.type === 'start' || node.type === 'end'
            ? 'bg-slate-800/70'
            : 'bg-slate-800/90'
        } backdrop-blur-sm`}
      >
        <CardContent className="p-4 relative">
          {/* Input Handle (Left) */}
          {node.type !== 'start' && (
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-slate-600 border-2 border-slate-400 rounded-full hover:bg-indigo-500 hover:border-indigo-400 transition-colors cursor-pointer connection-handle input-handle z-30"
              onMouseUp={handleConnectionEnd}
              title="Connect here from another node"
            />
          )}

          {/* Output Handles (Right) */}
          {node.type !== 'end' && (
            <>
              {node.type === 'choice' && choices.length > 0 ? (
                // Multiple output handles for choices
                choices.map((choice, index) => (
                  <div
                    key={index}
                    className="absolute right-0 w-4 h-4 bg-slate-600 border-2 border-slate-400 rounded-full hover:bg-purple-500 hover:border-purple-400 transition-colors cursor-pointer connection-handle output-handle z-30"
                    style={{
                      top: `${20 + (index * 30)}px`,
                      transform: 'translateX(50%)'
                    }}
                    onMouseDown={(e) => handleConnectionStart(e, index)}
                    title={`Connect choice: ${choice.substring(0, 30)}...`}
                  />
                ))
              ) : node.type === 'condition' ? (
                // Two output handles for condition (true/false)
                <>
                  <div
                    className="absolute right-0 w-4 h-4 bg-green-600 border-2 border-green-400 rounded-full hover:bg-green-500 transition-colors cursor-pointer connection-handle output-handle z-30"
                    style={{ top: '30px', transform: 'translateX(50%)' }}
                    onMouseDown={(e) => handleConnectionStart(e, 0)}
                    title="True condition"
                  >
                    <CheckCircle className="w-2 h-2 text-white absolute top-0 left-0 transform translate-x-1 translate-y-1" />
                  </div>
                  <div
                    className="absolute right-0 w-4 h-4 bg-red-600 border-2 border-red-400 rounded-full hover:bg-red-500 transition-colors cursor-pointer connection-handle output-handle z-30"
                    style={{ top: '60px', transform: 'translateX(50%)' }}
                    onMouseDown={(e) => handleConnectionStart(e, 1)}
                    title="False condition"
                  >
                    <XCircle className="w-2 h-2 text-white absolute top-0 left-0 transform translate-x-1 translate-y-1" />
                  </div>
                </>
              ) : (
                // Single output handle for other node types
                <div
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-slate-600 border-2 border-slate-400 rounded-full hover:bg-purple-500 hover:border-purple-400 transition-colors cursor-pointer connection-handle output-handle z-30"
                  onMouseDown={(e) => handleConnectionStart(e, 0)}
                  title="Connect to another node"
                />
              )}
            </>
          )}

          {/* Node Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${nodeColors[node.type]} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                {node.type.replace('_', ' ')}
              </Badge>
            </div>
            
            {isSelected && canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="w-6 h-6 text-slate-400 hover:text-blue-300 hover:bg-blue-500/10"
              >
                <Settings className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Character Info (for dialogue nodes) */}
          {node.type === 'dialogue' && (
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
              <User className="w-3 h-3" />
              <span>{character?.name || 'No character assigned'}</span>
            </div>
          )}

          {/* Node Content */}
          <div className="text-sm text-slate-200 leading-relaxed mb-4 min-h-[40px] flex items-center">
            {getDisplayContent()}
          </div>

          {/* Show Choices for Choice Nodes */}
          {node.type === 'choice' && choices.length > 0 && (
            <div className="space-y-1 mb-3">
              {choices.map((choice, index) => (
                <div key={index} className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border-l-2 border-purple-500">
                  {index + 1}. {choice.substring(0, 40)}{choice.length > 40 ? '...' : ''}
                </div>
              ))}
            </div>
          )}

          {/* Connection Count */}
          <div className="text-xs text-slate-500 text-center">
            {node.connections?.length || 0} connection{(node.connections?.length || 0) !== 1 ? 's' : ''}
          </div>

          {/* Conditions & Consequences Indicators */}
          {(node.conditions && node.conditions.length > 0 || node.consequences && node.consequences.length > 0) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
              {node.conditions && node.conditions.length > 0 && (
                <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                  {node.conditions.length} condition{node.conditions.length > 1 ? 's' : ''}
                </Badge>
              )}
              {node.consequences && node.consequences.length > 0 && (
                <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">
                  {node.consequences.length} action{node.consequences.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

