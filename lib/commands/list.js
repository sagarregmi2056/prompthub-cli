import { store } from '../db/store.js';
import chalk from 'chalk';
import { table } from 'table';

export async function listPrompts(options) {
  try {
    const prompts = store.listPrompts(
      parseInt(options.limit),
      options.tag
    );

    if (prompts.length === 0) {
      console.log(chalk.yellow('No prompts found'));
      return;
    }

    if (options.format === 'json') {
      console.log(JSON.stringify(prompts, null, 2));
      return;
    }

    const tableData = [
      ['ID', 'Prompt', 'Model', 'Tags', 'Created At']
    ];

    prompts.forEach(p => {
      tableData.push([
        chalk.cyan(p.id),
        p.prompt.length > 50 ? p.prompt.substring(0, 47) + '...' : p.prompt,
        p.model,
        p.tags.join(', '),
        new Date(p.created_at).toLocaleString()
      ]);
    });

    const config = {
      columns: {
        1: {
          width: 50,
          wrapWord: true
        }
      }
    };

    console.log(table(tableData, config));
  } catch (error) {
    console.error(chalk.red('Failed to list prompts:'), error);
  }
} 