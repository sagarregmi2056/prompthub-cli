import OpenAI from 'openai';
import axios from 'axios';
import { getConfig } from '../utils/config.js';

class ModelService {
  constructor() {
    const config = getConfig();
    this.provider = config.provider;
    this.model = config.model;
    this.maxTokens = config.maxTokens;
    this.apiKeys = config.apiKeys;

    // Initialize clients based on provider
    if (this.provider === 'OPENAI') {
      this.openaiClient = new OpenAI({
        apiKey: this.apiKeys.openai
      });
    }
  }

  async generateCompletion(prompt) {
    switch (this.provider) {
      case 'OPENAI':
        return this.generateOpenAICompletion(prompt);
      case 'LLAMA':
        return this.generateLlamaCompletion(prompt);
      case 'ANTHROPIC':
        return this.generateAnthropicCompletion(prompt);
      default:
        throw new Error(`Unsupported model provider: ${this.provider}`);
    }
  }

  async generateOpenAICompletion(prompt) {
    try {
      const completion = await this.openaiClient.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.maxTokens
      });

      return {
        text: completion.choices[0].message.content,
        usage: completion.usage,
        model: this.model
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async generateLlamaCompletion(prompt) {
    try {
      const response = await axios.post(this.apiKeys.llama.url, {
        prompt: prompt,
        model: this.model,
        max_tokens: this.maxTokens,
        api_key: this.apiKeys.llama.key
      });

      return {
        text: response.data.output,
        usage: response.data.usage,
        model: this.model
      };
    } catch (error) {
      throw new Error(`LLaMA API error: ${error.message}`);
    }
  }

  async generateAnthropicCompletion(prompt) {
    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.maxTokens
      }, {
        headers: {
          'x-api-key': this.apiKeys.anthropic,
          'anthropic-version': '2024-01-01'
        }
      });

      return {
        text: response.data.content[0].text,
        usage: response.data.usage,
        model: this.model
      };
    } catch (error) {
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
}

export default new ModelService(); 