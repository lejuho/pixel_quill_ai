import {
  BookOpen,
  MapPin,
  MessageSquare,
  Monitor,
  MoreHorizontal,
  Pen,
  Scroll,
  Sword,
  User,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import React from "react";

const textTypes = [
  { 
    id: "dialogue", 
    label: "Dialogue", 
    icon: MessageSquare, 
    description: "Character conversations and speech",
    color: "from-blue-400 to-blue-600"
  },
  { 
    id: "item_description", 
    label: "Item Description", 
    icon: Sword, 
    description: "Weapons, tools, and item details",
    color: "from-purple-400 to-purple-600"
  },
  { 
    id: "character_name", 
    label: "Character Names", 
    icon: User, 
    description: "NPCs, heroes, and character names",
    color: "from-green-400 to-green-600"
  },
  { 
    id: "location_description", 
    label: "Locations", 
    icon: MapPin, 
    description: "World settings and environment text",
    color: "from-orange-400 to-orange-600"
  },
  { 
    id: "quest_text", 
    label: "Quest Text", 
    icon: Scroll, 
    description: "Missions, objectives, and quest descriptions",
    color: "from-red-400 to-red-600"
  },
  { 
    id: "lore", 
    label: "Lore & Backstory", 
    icon: BookOpen, 
    description: "World history and background stories",
    color: "from-indigo-400 to-indigo-600"
  },
  { 
    id: "story_snippet", 
    label: "Story Snippets", 
    icon: Pen, 
    description: "Narrative elements and plot points",
    color: "from-pink-400 to-pink-600"
  },
  { 
    id: "ui_text", 
    label: "UI Text", 
    icon: Monitor, 
    description: "Menu items, buttons, and interface text",
    color: "from-cyan-400 to-cyan-600"
  },
  { 
    id: "combat_text", 
    label: "Combat Text", 
    icon: Zap, 
    description: "Battle descriptions and action text",
    color: "from-yellow-400 to-yellow-600"
  },
  { 
    id: "other", 
    label: "Other", 
    icon: MoreHorizontal, 
    description: "Custom or miscellaneous text",
    color: "from-gray-400 to-gray-600"
  }
];

export default function TextTypeSelector({ selectedType, onTypeSelect }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-white">What do you want to generate?</h3>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          Step 1
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {textTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-300 border-slate-700 hover:border-purple-500/50 ${
              selectedType === type.id 
                ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/20' 
                : 'bg-slate-800/50 hover:bg-slate-700/50'
            }`}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center flex-shrink-0`}>
                  <type.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white mb-1">{type.label}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}