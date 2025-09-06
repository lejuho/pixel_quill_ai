import {
  BookOpen,
  FileText,
  GitBranch,
  Plus,
  Settings2,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, DialogueGraph, GameVariable, Lore } from "@/entities/all";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState({
    dialogues: 0,
    characters: 0,
    loreEntries: 0,
    variables: 0
  });
  const [recentDialogues, setRecentDialogues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dialogues, characters, lore, variables] = await Promise.all([
        DialogueGraph.list("-created_date", 5),
        Character.list(),
        Lore.list(),
        GameVariable.list()
      ]);

      setStats({
        dialogues: dialogues.length,
        characters: characters.length,
        loreEntries: lore.length,
        variables: variables.length
      });

      setRecentDialogues(dialogues);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const statCards = [
    {
      title: "Dialogue Graphs",
      value: stats.dialogues,
      icon: GitBranch,
      color: "from-blue-500 to-cyan-500",
      link: createPageUrl("DialogueEditor")
    },
    {
      title: "Characters",
      value: stats.characters,
      icon: Users,
      color: "from-green-500 to-emerald-500",
      link: createPageUrl("Codex")
    },
    {
      title: "Lore Entries",
      value: stats.loreEntries,
      icon: BookOpen,
      color: "from-purple-500 to-violet-500",
      link: createPageUrl("Codex")
    },
    {
      title: "Variables",
      value: stats.variables,
      icon: Settings2,
      color: "from-orange-500 to-amber-500",
      link: createPageUrl("Codex")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            NarrativeAI Engine
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Build complex, branching dialogues with AI-powered narrative consistency. Your characters remember, your world evolves.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={stat.link}>
                <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400 font-medium">{stat.title}</p>
                        <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to={createPageUrl("DialogueEditor")}>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Dialogue
                </Button>
              </Link>
              
              <Link to={createPageUrl("Codex")}>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Users className="w-4 h-4 mr-2" />
                  Add Character
                </Button>
              </Link>
              
              <Link to={createPageUrl("Export")}>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Dialogues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Recent Dialogues
                </CardTitle>
                <Link to={createPageUrl("DialogueEditor")}>
                  <Button variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentDialogues.length > 0 ? (
                <div className="space-y-4">
                  {recentDialogues.slice(0, 3).map((dialogue, index) => (
                    <motion.div
                      key={dialogue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <GitBranch className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{dialogue.title}</h4>
                          <p className="text-sm text-slate-400">{dialogue.category?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                      <Link to={`${createPageUrl("DialogueEditor")}?graph=${dialogue.id}`}>
                        <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                          Edit
                        </Button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No dialogues yet</h3>
                  <p className="text-sm mb-4">Create your first dialogue graph to get started</p>
                  <Link to={createPageUrl("DialogueEditor")}>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Dialogue
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}