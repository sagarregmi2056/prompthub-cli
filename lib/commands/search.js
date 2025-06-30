import { store } from '../db/store.js';
import chalk from 'chalk';
import { table } from 'table';

export async function searchPrompts(query, options) {
  try {
    const prompts = await store.searchPrompts(query, options.in);

    if (!Array.isArray(prompts) || prompts.length === 0) {
      console.log(chalk.yellow(`No prompts found matching "${query}"`));
      return;
    }

    const tableData = [
      ['ID', 'Prompt', 'Model', 'Tags', 'Created At'],
    ];

    prompts.forEach(p => {
      tableData.push([
        chalk.cyan(p.id),
        p.prompt.length > 50 ? p.prompt.substring(0, 47) + '...' : p.prompt,
        p.model || 'N/A',
        (p.tags || []).join(', '),
        new Date(p.created_at).toLocaleString(),
      ]);
    });

    const config = {
      columns: {
        1: {
          width: 50,
          wrapWord: true,
        },
      },
    };

    console.log(chalk.green(`\nFound ${prompts.length} matching prompts:\n`));
    console.log(table(tableData, config));
  } catch (error) {
    console.error(chalk.red('Failed to search prompts:'), error);
  }
} 