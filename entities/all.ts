// Represents a single node in a dialogue graph
export class DialogueNode {
  id?: string; // Optional for creation
  graph_id: string;
  node_id: string;
  type: 'start' | 'dialogue' | 'choice' | 'condition' | 'action' | 'end';
  position: { x: number; y: number };
  content: string;
  character_id?: string;
  connections: string[];
  conditions?: any[];
  consequences?: any[];
  choices?: string[];

  constructor(data: Omit<DialogueNode, 'id'> & { id?: string }) {
    this.id = data.id;
    this.graph_id = data.graph_id;
    this.node_id = data.node_id;
    this.type = data.type;
    this.position = data.position;
    this.content = data.content;
    this.character_id = data.character_id;
    this.connections = data.connections || [];
    this.conditions = data.conditions;
    this.consequences = data.consequences;
    this.choices = data.choices;
  }

  static async list(sort?: string): Promise<DialogueNode[]> {
    console.log("Listing nodes...");
    return [];
  }

  static async filter(query: any): Promise<DialogueNode[]> {
    console.log("Filtering nodes with query:", query);
    return [];
  }

  static async create(data: Partial<DialogueNode>): Promise<DialogueNode> {
    console.log("Creating node...", data);
    const newNode = { id: `node_${Date.now()}`, ...data } as DialogueNode;
    return newNode;
  }

  static async update(id: string, data: Partial<DialogueNode>): Promise<DialogueNode> {
    console.log(`Updating node ${id}...`, data);
    return { id, ...data } as DialogueNode;
  }

  static async delete(id: string): Promise<void> {
    console.log(`Deleting node ${id}...`);
    return;
  }
}

export class Character {
  id: string;
  name: string;
  personality?: string;
  voice_style?: string;
  role?: string;
  backstory?: string;

  static async list(sort?: string): Promise<Character[]> {
    console.log("Fetching characters...");
    return [
      { id: 'char_1', name: 'Captain Eva' },
      { id: 'char_2', name: 'Rogue AI X-1' },
    ];
  }

constructor(data: Omit<Character, 'id'> & { id?: string }) {
    this.id = data.id || '';
    this.name = data.name;
    this.personality = data.personality;
    this.voice_style = data.voice_style;
    this.role = data.role;
    this.backstory = data.backstory;
  }

  static async create(data: Partial<Character>): Promise<Character> {
    console.log("Creating character...", data);
    const newCharacter = { id: `char_${Date.now()}`, ...data } as Character;
    return newCharacter;
  }

  static async update(id: string, data: Partial<Character>): Promise<Character> {
    console.log(`Updating character ${id}...`, data);
    return { id, ...data } as Character;
  }

  static async delete(id: string): Promise<void> {
    console.log(`Deleting character ${id}...`);
    return;
  }
}

export class GameVariable {
  id: string;
  name: string;
  display_name?: string;
  value: any;

  static async list(sort?: string): Promise<GameVariable[]> {
    console.log("Fetching game variables...");
    return [
      { id: 'var_1', name: 'player_rep', display_name: 'Player Reputation', value: 50 },
      { id: 'var_2', name: 'quest_status', display_name: 'Main Quest Status', value: 'started' },
    ];
  }

  constructor(data: Omit<GameVariable, 'id'> & { id?: string }) {
    this.id = data.id || '';
    this.name = data.name;
    this.display_name = data.display_name;
    this.value = data.value;
  }

  static async create(data: Partial<GameVariable>): Promise<GameVariable> {
    console.log("Creating variable...", data);
    const newVar = { id: `var_${Date.now()}`, ...data } as GameVariable;
    return newVar;
  }

  static async update(id: string, data: Partial<GameVariable>): Promise<GameVariable> {
    console.log(`Updating variable ${id}...`, data);
    return { id, ...data } as GameVariable;
  }

  static async delete(id: string): Promise<void> {
    console.log(`Deleting variable ${id}...`);
    return;
  }
}

export class Lore {
  id: string;
  title: string;
  content: string;
  category: string;

  constructor(data: Omit<Lore, 'id'> & { id?: string }) {
    this.id = data.id || '';
    this.title = data.title;
    this.content = data.content;
    this.category = data.category;
  }

  static async list(sort?: string): Promise<Lore[]> {
    console.log("Fetching lore entries...");
    return [
      { id: 'lore_1', title: 'The Ancient War', content: 'A long time ago...', category: 'History' },
      { id: 'lore_2', title: 'Planet X', content: 'A mysterious planet...', category: 'Locations' },
    ];
  }

  static async create(data: Partial<Lore>): Promise<Lore> {
    console.log("Creating lore...", data);
    const newLore = { id: `lore_${Date.now()}`, ...data } as Lore;
    return newLore;
  }

  static async update(id: string, data: Partial<Lore>): Promise<Lore> {
    console.log(`Updating lore ${id}...`, data);
    return { id, ...data } as Lore;
  }

  static async delete(id: string): Promise<void> {
    console.log(`Deleting lore ${id}...`);
    return;
  }
}

export class DialogueGraph {
  id: string;
  title: string;
  description?: string;
  category?: string;

  constructor(data: Omit<DialogueGraph, 'id'> & { id?: string }) {
    this.id = data.id || '';
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
  }

  static async list(sort?: string, limit?: number): Promise<DialogueGraph[]> {
    console.log(`Fetching dialogue graphs (sort: ${sort}, limit: ${limit})...`);
    return [
      { id: 'graph_1', title: 'Main Quest Intro', category: 'Quests' },
      { id: 'graph_2', title: 'Side Quest: The Lost Artifact', category: 'Side Quests' },
    ];
  }

  static async filter(query: any): Promise<DialogueGraph[]> {
    console.log("Filtering graphs with query:", query);
    if (query.id) {
      return [{ id: query.id, title: 'Filtered Graph' }];
    }
    return [];
  }

  static async create(data: Partial<DialogueGraph>): Promise<DialogueGraph> {
    console.log("Creating graph...", data);
    const newGraph = { id: `graph_${Date.now()}`, ...data } as DialogueGraph;
    return newGraph;
  }

  static async update(id: string, data: Partial<DialogueGraph>): Promise<DialogueGraph> {
    console.log(`Updating graph ${id}...`, data);
    return { id, ...data } as DialogueGraph;
  }

  static async delete(id: string): Promise<void> {
    console.log(`Deleting graph ${id}...`);
    return;
  }
}