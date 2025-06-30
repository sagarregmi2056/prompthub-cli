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
  initializeStore,
  forkPrompt,
  showLineage,
  checkOutdated,
  testPrompts,
} from '../lib/commands/index.js';
import { checkConfig, ConfigManager } from '../lib/utils/config.js';
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
const commandsNeedingConfig = ['save', 'fork', 'test'];

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
  .command('remote')
  .description('Configure remote storage')
  .argument('<type>', 'Remote storage type (s3, github, rest)')
  .option('--bucket <n>', 'S3 bucket name')
  .option('--region <region>', 'S3 region')
  .option('--repo <owner/repo>', 'GitHub repository')
  .option('--url <url>', 'REST API URL')
  .action(async (type, options) => {
    const configManager = new ConfigManager();
    await configManager.load();
    await configManager.setRemote(type, options);
    console.log(`Remote storage configured: ${type}`);
  });

program
  .command('branch')
  .description('Create or switch branches')
  .argument('<n>', 'Branch name')
  .option('--create', 'Create a new branch')
  .action(async (_name, _options) => {
    // TODO: Implement branch management
    console.log('Branch management coming soon!');
  });

program
  .command('save')
  .description('Save a new prompt version')
  .option('-p, --prompt <string>', 'Prompt text')
  .option('-f, --file <path>', 'Load prompt from file')
  .option('-m, --model <string>', 'AI model to use', 'gpt-4')
  .option('-t, --tags <tags...>', 'Tags for the prompt')
  .option('-b, --branch <name>', 'Branch to save to', 'main')
  .option('--no-execute', 'Save prompt without executing')
  .option('--skip-outdated-check', 'Skip checking for outdated prompts after save')
  .action(savePrompt);

program
  .command('fork')
  .description('Create a new prompt variant from an existing prompt')
  .argument('<parent-id>', 'ID of the parent prompt')
  .option('-p, --prompt <string>', 'New prompt text (uses parent prompt if not provided)')
  .option('-f, --file <path>', 'Load prompt from file')
  .option('-m, --model <string>', 'AI model to use', 'gpt-4')
  .option('-t, --tags <tags...>', 'Additional tags for the variant')
  .option('--no-execute', 'Save prompt without executing')
  .action(forkPrompt);

program
  .command('test')
  .description('Run A/B tests on two prompts')
  .argument('<prompt1-id>', 'First prompt ID')
  .argument('<prompt2-id>', 'Second prompt ID')
  .option('-n, --samples <number>', 'Number of test samples', '1')
  .option('-m, --model <string>', 'AI model to use', 'gpt-3.5-turbo')
  .option('-o, --output <file>', 'Export results to CSV')
  .action(testPrompts);

program
  .command('lineage')
  .description('Show the ancestry tree of a prompt')
  .argument('<prompt-id>', 'ID of the prompt to show lineage for')
  .action(showLineage);

program
  .command('check-outdated')
  .description('Check for prompts that need updating due to parent changes')
  .action(checkOutdated);

program
  .command('list')
  .description('List saved prompts')
  .option('-n, --limit <number>', 'Number of prompts to show', '10')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-b, --branch <name>', 'Filter by branch')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .action(listPrompts);

program
  .command('search')
  .description('Search prompts')
  .argument('<query>', 'Search term')
  .option('--in <field>', 'Search in specific field (prompt|response|tags)', 'prompt')
  .option('-b, --branch <name>', 'Search in specific branch')
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
  .option('-b, --branch <name>', 'Branch to restore to')
  .action(restorePrompt);

program.parse(process.argv); 