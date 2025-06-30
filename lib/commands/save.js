import { OpenAI } from 'openai';
import { store } from '../db/store.js';
import { generateId } from '../utils/id.js';
import fs from 'fs/promises';
import ora from 'ora';
import chalk from 'chalk';

let client = null;

const initializeOpenAI = () => {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required to execute prompts');
    }
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
};

export async function savePrompt(options) {
  const spinner = ora('Processing prompt...').start();
  
  try {
    let promptText = options.prompt;
    if (options.file) {
      promptText = await fs.readFile(options.file, 'utf-8');
    }

    if (!promptText) {
      throw new Error('No prompt provided');
    }

    // If this is a fork, verify parent exists
    if (options.parentId) {
      const parent = await store.getPrompt(options.parentId);
      if (!parent) {
        throw new Error(`Parent prompt with ID ${options.parentId} not found`);
      }
      spinner.text = 'Creating variant from parent prompt...';
    }

    const id = generateId();
    let response = null;

    if (options.execute !== false) {
      try {
        const openai = initializeOpenAI();
        spinner.text = 'Executing prompt...';
        const completion = await openai.chat.completions.create({
          model: options.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: promptText }],
        });
        response = completion.choices[0].message.content;
      } catch (error) {
        console.warn(chalk.yellow('Failed to execute prompt:', error.message));
        console.warn(chalk.yellow('Saving prompt without execution...'));
      }
    }

    // Add variant tag if this is a fork
    const tags = options.tags || [];
    if (options.parentId && !tags.includes('variant')) {
      tags.push('variant');
    }

    await store.savePrompt(id, promptText, response, options.model, tags, {
      executed: options.execute !== false && response !== null,
      source: options.file ? 'file' : 'cli',
    }, options.parentId);

    spinner.succeed(chalk.green(`Prompt ${options.parentId ? 'variant ' : ''}saved with ID: ${id}`));

    if (response) {
      console.log('\nResponse:');
      console.log(chalk.cyan(response));
    }

    // Check for outdated prompts after save
    if (!options.skipOutdatedCheck) {
      const outdated = await store.checkOutdated();
      if (outdated.length > 0) {
        console.log('\n' + chalk.yellow('⚠️  Outdated prompts detected:'));
        outdated.forEach(({ prompt, parent }) => {
          console.log(chalk.yellow(`• ${prompt.id} (child of ${parent.id}; parent updated at ${parent.created_at})`));
        });
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to save prompt'));
    console.error(error);
  }
} 