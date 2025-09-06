
export class Template {
  id: string;
  name: string;
  description: string;
  prompt_template: string;
  text_type: string;
  suggested_genre?: string;
  is_popular?: boolean;

  constructor(data: Omit<Template, 'id'> & { id?: string }) {
    this.id = data.id || '';
    this.name = data.name;
    this.description = data.description;
    this.prompt_template = data.prompt_template;
    this.text_type = data.text_type;
    this.suggested_genre = data.suggested_genre;
    this.is_popular = data.is_popular;
  }
  static async list(sort?: string): Promise<Template[]> {
    console.log(`Fetching templates (sort: ${sort})...`);
    return [
      { id: 'temp_1', name: 'Fantasy Dialogue', description: 'A template for fantasy character dialogue.', prompt_template: 'Generate a dialogue between a knight and a dragon.', text_type: 'dialogue', suggested_genre: 'fantasy', is_popular: true },
      { id: 'temp_2', name: 'Sci-Fi Item Description', description: 'A template for sci-fi item descriptions.', prompt_template: 'Describe a futuristic weapon.', text_type: 'item_description', suggested_genre: 'sci_fi', is_popular: false },
    ];
  }
}
