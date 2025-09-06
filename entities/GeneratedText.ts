
export class GeneratedText {
  id?: string;
  title: string;
  content: string;
  text_type: string;
  genre: string;
  tone: string;
  length: string;
  tags: string[];

  constructor(data: Omit<GeneratedText, 'id'> & { id?: string }) {
    this.id = data.id || '';
    this.title = data.title;
    this.content = data.content;
    this.text_type = data.text_type;
    this.genre = data.genre;
    this.tone = data.tone;
    this.length = data.length;
    this.tags = data.tags || [];
  }
  
  static async list(sort?: string): Promise<GeneratedText[]> {
    console.log(`Fetching generated texts (sort: ${sort})...`);
    return [
      { id: 'gen_1', title: 'Sample Dialogue', content: 'Hello world', text_type: 'dialogue', genre: 'fantasy', tone: 'neutral', length: 'medium', tags: [] },
    ];
  }

  static async create(data: Partial<GeneratedText>): Promise<GeneratedText> {
    console.log("Saving generated text...", data);
    const newText = { id: `gen_${Date.now()}`, ...data } as GeneratedText;
    // In a real app, this would save to a database.
    return newText;
  }

  static async delete(id: string): Promise<void> {
    console.log(`Deleting generated text ${id}...`);
    return;
  }
}
