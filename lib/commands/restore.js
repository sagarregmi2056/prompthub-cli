import { store } from '../db/store.js';
import chalk from 'chalk';
import fs from 'fs/promises';
import ora from 'ora';

export async function restorePrompt(id, options) {
  const spinner = ora('Restoring prompt...').start();

  try {
    const prompt = store.getPrompt(id);

    if (!prompt) {
      spinner.fail(chalk.red(`No prompt found with ID: ${id}`));
      return;
    }

    if (options.output) {
      await fs.writeFile(options.output, prompt.prompt);
      spinner.succeed(chalk.green(`Prompt restored to file: ${options.output}`));
    } else {
      spinner.stop();
      console.log('\nPrompt:');
      console.log(chalk.cyan(prompt.prompt));
      
      if (prompt.response) {
        console.log('\nOriginal Response:');
        console.log(chalk.yellow(prompt.response));
      }

      console.log('\nMetadata:');
      console.log(JSON.stringify(prompt.metadata, null, 2));
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to restore prompt'));
    console.error(error);
  }
} 