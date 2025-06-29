import { store } from '../db/store.js';
import chalk from 'chalk';
import ora from 'ora';

export async function initializeStore() {
  const spinner = ora('Initializing prompt version control...').start();
  
  try {
    // Store is automatically initialized when imported
    spinner.succeed(chalk.green('Prompt version control initialized successfully'));
    console.log('\nYou can now start using the following commands:');
    console.log(chalk.cyan('\npv save') + ' - Save a new prompt');
    console.log(chalk.cyan('pv list') + ' - List saved prompts');
    console.log(chalk.cyan('pv search') + ' - Search prompts');
    console.log(chalk.cyan('pv diff') + ' - Compare prompt versions');
    console.log(chalk.cyan('pv restore') + ' - Restore a previous version\n');
  } catch (error) {
    spinner.fail(chalk.red('Failed to initialize prompt version control'));
    console.error(error);
  }
} 