import { AlignLeft, Palette, Sliders, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { Textarea } from "@/components/ui/textarea";

const genres = [
  { value: "fantasy", label: "Fantasy", emoji: "🧙‍♂️" },
  { value: "sci_fi", label: "Sci-Fi", emoji: "🚀" },
  { value: "horror", label: "Horror", emoji: "👻" },
  { value: "cyberpunk", label: "Cyberpunk", emoji: "🤖" },
  { value: "medieval", label: "Medieval", emoji: "⚔️" },
  { value: "modern", label: "Modern", emoji: "🌆" },
  { value: "post_apocalyptic", label: "Post-Apocalyptic", emoji: "☢️" },
  { value: "steampunk", label: "Steampunk", emoji: "⚙️" },
  { value: "space_opera", label: "Space Opera", emoji: "🌌" },
  { value: "mystery", label: "Mystery", emoji: "🔍" }
];

const tones = [
  { value: "serious", label: "Serious", color: "slate" },
  { value: "humorous", label: "Humorous", color: "yellow" },
  { value: "dark", label: "Dark", color: "gray" },
  { value: "epic", label: "Epic", color: "purple" },
  { value: "casual", label: "Casual", color: "blue" },
  { value: "mysterious", label: "Mysterious", color: "indigo" },
  { value: "dramatic", label: "Dramatic", color: "red" },
  { value: "lighthearted", label: "Lighthearted", color: "green" }
];
interface ParameterControlsProps {
  parameters: {
    genre: string;
    tone: string;
    length: string;
    title?: string;
  };
  onParameterChange: (param: string, value: string) => void;
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
  className?: string;
}
export default function ParameterControls({ 
  parameters, 
  onParameterChange, 
  customPrompt,
  onCustomPromptChange,
  className = "" 
}: ParameterControlsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold text-white">Configure Your Generation</h3>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          Step 2
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Genre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={parameters.genre} onValueChange={(value:string) => onParameterChange('genre', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Choose a genre" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {genres.map((genre) => (
                  <SelectItem key={genre.value} value={genre.value} className="text-white hover:bg-slate-600">
                    <span className="flex items-center gap-2">
                      <span>{genre.emoji}</span>
                      {genre.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tone Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-400" />
              Tone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={parameters.tone} onValueChange={(value:string) => onParameterChange('tone', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {tones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value} className="text-white hover:bg-slate-600">
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Length Selection */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-green-400" />
              Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={parameters.length} onValueChange={(value:string) => onParameterChange('length', value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Choose length" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="short" className="text-white hover:bg-slate-600">Short (1-2 sentences)</SelectItem>
                <SelectItem value="medium" className="text-white hover:bg-slate-600">Medium (3-5 sentences)</SelectItem>
                <SelectItem value="long" className="text-white hover:bg-slate-600">Long (6+ sentences)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Title Input */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-400" />
              Title (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input 
              placeholder="Name this generation..."
              value={parameters.title || ''}
              onChange={(e) => onParameterChange('title', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </CardContent>
        </Card>
      </div>

      {/* Custom Prompt */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white">Additional Context (Optional)</CardTitle>
          <p className="text-sm text-slate-400">Add specific details, characters, or context for more targeted generation</p>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="e.g., Generate dialogue for a wise old wizard meeting a young adventurer in a mystical forest..."
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}