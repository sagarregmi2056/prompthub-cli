import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import dotenv from 'dotenv';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = join(process.cwd(), '.prompthub', 'config.yml');
const ENV_FILE = '.env';

const SUPPORTED_PROVIDERS = {
  OPENAI: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    required_env: ['OPENAI_API_KEY']
  },
  LLAMA: {
    name: 'LLaMA',
    models: ['llama-2-7b', 'llama-2-13b', 'llama-2-70b'],
    required_env: ['LLAMA_API_URL', 'LLAMA_API_KEY']
  },
  ANTHROPIC: {
    name: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet'],
    required_env: ['ANTHROPIC_API_KEY']
  }
};

export class Config {
  constructor() {
    this.config = null;
  }

  async load() {
    try {
      const content = await fs.readFile(CONFIG_FILE, 'utf-8');
      this.config = yaml.load(content);
    } catch {
      this.config = {
        storage: {
          type: 'local',
          path: '.prompthub/prompts'
        },
        remote: null
      };
    }
    return this.config;
  }

  async save() {
    await fs.writeFile(CONFIG_FILE, yaml.dump(this.config));
  }

  async setRemote(type, config) {
    const validTypes = ['s3', 'github', 'rest'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid remote type. Must be one of: ${validTypes.join(', ')}`);
    }

    this.config.remote = {
      type,
      ...config
    };

    await this.save();
  }

  async getRemote() {
    return this.config?.remote || null;
  }

  async checkConfig() {
    // Load .env file
    dotenv.config();

    // Check for required environment variables
    const requiredEnvVars = ['OPENAI_API_KEY'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
      // Create .env template if it doesn't exist
      try {
        await fs.access('.env');
      } catch {
        const template = `# Required for prompt execution
OPENAI_API_KEY=your_api_key_here

# Optional: Remote storage configuration
# S3_BUCKET=your-bucket-name
# S3_REGION=your-region
# GITHUB_TOKEN=your-github-token
# GITHUB_REPO=owner/repo
# REST_API_URL=https://your-api.com
# REST_API_KEY=your-api-key
`;
        await fs.writeFile('.env', template);
      }

      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}\nPlease check your .env file.`);
    }
  }
}

export const config = new Config();

export async function checkConfig() {
  try {
    // Check .env file
    await checkEnvFile();
    
    // Check config file
    await fs.access(CONFIG_FILE);
  } catch (error) {
    if (error.code === 'ENV_NOT_FOUND') {
      throw error;
    }
    await initializeConfig();
  }
}

async function checkEnvFile() {
  try {
    // Load .env file
    const result = dotenv.config();
    
    if (result.error) {
      throw new Error('ENV_NOT_FOUND');
    }

    // Get selected provider from env or default to OpenAI
    const selectedProvider = process.env.MODEL_PROVIDER?.toUpperCase() || 'OPENAI';
    
    if (!SUPPORTED_PROVIDERS[selectedProvider]) {
      console.error(chalk.red(`Error: Unsupported model provider: ${selectedProvider}`));
      console.error(chalk.cyan('Supported providers:'));
      Object.entries(SUPPORTED_PROVIDERS).forEach(([key, provider]) => {
        console.error(chalk.cyan(`- ${key}: ${provider.name}`));
        console.error(chalk.gray(`  Models: ${provider.models.join(', ')}`));
      });
      throw new Error('INVALID_PROVIDER');
    }

    // Check for required environment variables based on provider
    const requiredEnvVars = SUPPORTED_PROVIDERS[selectedProvider].required_env;
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error(chalk.red(`Error: Missing required environment variables for ${selectedProvider}:`));
      console.error(chalk.yellow(missingVars.join(', ')));
      console.error(chalk.cyan('\nPlease update your .env file with the required variables.'));
      throw new Error('ENV_INCOMPLETE');
    }

    // Validate selected model if specified
    const selectedModel = process.env.MODEL;
    if (selectedModel && !SUPPORTED_PROVIDERS[selectedProvider].models.includes(selectedModel)) {
      console.error(chalk.red(`Error: Invalid model '${selectedModel}' for provider ${selectedProvider}`));
      console.error(chalk.cyan('Supported models:'));
      console.error(chalk.cyan(SUPPORTED_PROVIDERS[selectedProvider].models.join(', ')));
      throw new Error('INVALID_MODEL');
    }
  } catch (error) {
    if (error.message === 'ENV_NOT_FOUND' || error.message === 'ENV_INCOMPLETE') {
      await createEnvTemplate();
      throw new Error('Please configure your .env file with the required API keys');
    }
    throw error;
  }
}

async function createEnvTemplate() {
  const envTemplate = `# AI Model Configuration
# Choose your model provider (OPENAI, LLAMA, ANTHROPIC)
MODEL_PROVIDER=OPENAI

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
# MODEL=gpt-4  # Optional: Specify model (gpt-4, gpt-3.5-turbo)

# LLaMA Configuration (Required if using LLaMA)
# MODEL_PROVIDER=LLAMA
# LLAMA_API_URL=your_llama_api_url_here
# LLAMA_API_KEY=your_llama_api_key_here
# MODEL=llama-2-7b  # Optional: Specify model (llama-2-7b, llama-2-13b, llama-2-70b)

# Anthropic Configuration (Required if using Anthropic)
# MODEL_PROVIDER=ANTHROPIC
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# MODEL=claude-3-opus  # Optional: Specify model (claude-3-opus, claude-3-sonnet)

# General Configuration
MAX_TOKENS=2000  # Maximum tokens for responses
`;

  try {
    await fs.writeFile(ENV_FILE, envTemplate);
    console.log(chalk.green('\nCreated .env template file.'));
    console.log(chalk.cyan('Please edit the .env file and configure your preferred model provider.'));
  } catch (error) {
    console.error(chalk.red('Error creating .env template:', error.message));
  }
}

async function initializeConfig() {
  const provider = process.env.MODEL_PROVIDER?.toUpperCase() || 'OPENAI';
  const defaultModel = SUPPORTED_PROVIDERS[provider].models[0];

  const defaultConfig = {
    version: '1.0.0',
    provider: provider,
    default_model: process.env.MODEL || defaultModel,
    max_tokens: parseInt(process.env.MAX_TOKENS) || 2000,
    storage: {
      type: 'file',
      path: '.prompthub/prompts'
    },
    display: {
      color: true,
      format: 'table'
    }
  };

  await fs.mkdir('.prompthub', { recursive: true });
  await fs.mkdir('.prompthub/prompts', { recursive: true });
  await fs.writeFile(CONFIG_FILE, yaml.stringify(defaultConfig));
}

export function getConfig() {
  const provider = process.env.MODEL_PROVIDER?.toUpperCase() || 'OPENAI';
  return {
    provider: provider,
    model: process.env.MODEL || SUPPORTED_PROVIDERS[provider].models[0],
    maxTokens: parseInt(process.env.MAX_TOKENS) || 2000,
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
      llama: {
        url: process.env.LLAMA_API_URL,
        key: process.env.LLAMA_API_KEY
      },
      anthropic: process.env.ANTHROPIC_API_KEY
    }
  };
}

export function getSupportedProviders() {
  return SUPPORTED_PROVIDERS;
}