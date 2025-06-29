import { OpenAI } from 'openai';
import { store } from '../db/store.js';
import { generateId } from '../utils/id.js';
import fs from 'fs/promises';
import ora from 'ora';
import chalk from 'chalk';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

    const id = generateId();
    let response = null;

    if (options.execute !== false) {
      spinner.text = 'Executing prompt...';
      const completion = await client.chat.completions.create({
        model: options.model,
        messages: [{ role: 'user', content: promptText }]
      });
      response = completion.choices[0].message.content;
    }

    store.savePrompt(id, promptText, response, options.model, options.tags || [], {
      executed: options.execute !== false,
      source: options.file ? 'file' : 'cli'
    });

    spinner.succeed(chalk.green(`Prompt saved with ID: ${id}`));

    if (response) {
      console.log('\nResponse:');
      console.log(chalk.cyan(response));
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to save prompt'));
    console.error(error);
  }
} 