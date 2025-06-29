import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = join(process.cwd(), '.prompthub', 'prompts');
const TAGS_FILE = join(process.cwd(), '.prompthub', 'tags.json');

export class PromptStore {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      await this.ensureStorageDirectory();
      this.initialized = true;
    }
  }

  async ensureStorageDirectory() {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    // Initialize tags file if it doesn't exist
    try {
      await fs.access(TAGS_FILE);
    } catch {
      await fs.writeFile(TAGS_FILE, JSON.stringify({}));
    }
  }

  async savePrompt(id, prompt, response, model, tags = [], metadata = {}) {
    await this.init();
    
    const promptData = {
      id,
      prompt,
      response,
      model,
      created_at: new Date().toISOString(),
      metadata
    };

    // Save prompt to its own file
    const promptFile = join(STORAGE_DIR, `${id}.json`);
    await fs.writeFile(promptFile, JSON.stringify(promptData, null, 2));

    // Update tags
    const tagsData = await this.loadTags();
    tags.forEach(tag => {
      if (!tagsData[tag]) {
        tagsData[tag] = [];
      }
      if (!tagsData[tag].includes(id)) {
        tagsData[tag].push(id);
      }
    });
    await fs.writeFile(TAGS_FILE, JSON.stringify(tagsData, null, 2));
  }

  async getPrompt(id) {
    await this.init();
    try {
      const promptFile = join(STORAGE_DIR, `${id}.json`);
      const content = await fs.readFile(promptFile, 'utf-8');
      const promptData = JSON.parse(content);
      promptData.tags = await this.getPromptTags(id);
      return promptData;
    } catch {
      return null;
    }
  }

  async listPrompts(limit = 10, tag = null) {
    await this.init();
    try {
      let promptFiles = await fs.readdir(STORAGE_DIR);
      promptFiles = promptFiles.filter(file => file.endsWith('.json'));

      let prompts = await Promise.all(
        promptFiles.map(async file => {
          const content = await fs.readFile(join(STORAGE_DIR, file), 'utf-8');
          return JSON.parse(content);
        })
      );

      // Sort by creation date, newest first
      prompts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (tag) {
        const tagsData = await this.loadTags();
        const taggedIds = tagsData[tag] || [];
        prompts = prompts.filter(p => taggedIds.includes(p.id));
      }

      // Add tags to each prompt
      prompts = await Promise.all(
        prompts.map(async p => ({
          ...p,
          tags: await this.getPromptTags(p.id)
        }))
      );

      return prompts.slice(0, limit);
    } catch (error) {
      console.error('Error listing prompts:', error);
      return [];
    }
  }

  async searchPrompts(query, field = 'prompt') {
    await this.init();
    const promptFiles = await fs.readdir(STORAGE_DIR);
    const prompts = await Promise.all(
      promptFiles
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const content = await fs.readFile(join(STORAGE_DIR, file), 'utf-8');
          const promptData = JSON.parse(content);
          promptData.tags = await this.getPromptTags(promptData.id);
          return promptData;
        })
    );

    return prompts.filter(p => {
      if (field === 'tags') {
        return p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      }
      const fieldValue = p[field];
      return fieldValue && fieldValue.toLowerCase().includes(query.toLowerCase());
    });
  }

  async loadTags() {
    await this.init();
    try {
      const content = await fs.readFile(TAGS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  async getPromptTags(promptId) {
    await this.init();
    const tagsData = await this.loadTags();
    return Object.entries(tagsData)
      .filter(([_, ids]) => ids.includes(promptId))
      .map(([tag]) => tag);
  }
}

export const store = new PromptStore();