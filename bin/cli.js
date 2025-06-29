#!/usr/bin/env node
import { program } from 'commander';
import { config } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  savePrompt,
  listPrompts,
  searchPrompts,
  diffPrompts,
  restorePrompt,
  initializeStore
} from '../lib/commands/index.js';
import { checkConfig } from '../lib/utils/config.js';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env') });

// Read package.json for version
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

program
  .name('prompthub')
  .description('Git-style version control for AI prompts')
  .version(packageJson.version);

// Only check config for commands that need it
const commandsNeedingConfig = ['save'];

program
  .hook('preAction', async (thisCommand) => {
    if (commandsNeedingConfig.includes(thisCommand.name())) {
      await checkConfig();
    }
  });

program
  .command('init')
  .description('Initialize prompt version control in current directory')
  .action(initializeStore);

program
  .command('save')
  .description('Save a new prompt version')
  .option('-p, --prompt <string>', 'Prompt text')
  .option('-f, --file <path>', 'Load prompt from file')
  .option('-m, --model <string>', 'AI model to use', 'gpt-4')
  .option('-t, --tags <tags...>', 'Tags for the prompt')
  .option('--no-execute', 'Save prompt without executing')
  .action(savePrompt);

program
  .command('list')
  .description('List saved prompts')
  .option('-n, --limit <number>', 'Number of prompts to show', '10')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(listPrompts);

program
  .command('search')
  .description('Search prompts')
  .argument('<query>', 'Search term')
  .option('--in <field>', 'Search in specific field (prompt|response|tags)', 'prompt')
  .action(searchPrompts);

program
  .command('diff')
  .description('Show differences between prompt versions')
  .argument('<id1>', 'First prompt ID')
  .argument('<id2>', 'Second prompt ID')
  .option('--color', 'Show colored diff', true)
  .action(diffPrompts);

program
  .command('restore')
  .description('Restore a previous prompt version')
  .argument('<id>', 'Prompt ID to restore')
  .option('-o, --output <file>', 'Output file')
  .action(restorePrompt);

program.parse(process.argv); 