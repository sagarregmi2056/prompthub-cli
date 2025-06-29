import { store } from '../db/store.js';
import chalk from 'chalk';

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function printPromptNode(prompt, prefix = '', isLast = true) {
  const connector = isLast ? '└─ ' : '├─ ';
  const childPrefix = isLast ? '   ' : '│  ';
  
  console.log(prefix + connector + chalk.cyan(prompt.id) + ' ' + chalk.white(`"${prompt.prompt.slice(0, 50)}${prompt.prompt.length > 50 ? '...' : ''}"`) + ' ' + chalk.gray(formatDate(prompt.created_at)));
  return childPrefix;
}

async function printDescendantsTree(descendants, prefix = '') {
  for (let i = 0; i < descendants.length; i++) {
    const { prompt, children } = descendants[i];
    const isLast = i === descendants.length - 1;
    const newPrefix = prefix + printPromptNode(prompt, prefix, isLast);
    await printDescendantsTree(children, newPrefix);
  }
}

export async function showLineage(promptId) {
  try {
    const lineage = await store.getLineage(promptId);
    if (!lineage) {
      console.error(chalk.red(`Prompt with ID ${promptId} not found`));
      return;
    }

    console.log(chalk.bold('\nPrompt Lineage Tree:'));
    console.log(chalk.yellow('\nAncestors:'));
    
    // Print ancestors
    for (let i = 0; i < lineage.ancestors.length; i++) {
      const ancestor = lineage.ancestors[i];
      const prefix = '  '.repeat(i);
      printPromptNode(ancestor, prefix);
    }

    // Print the main prompt
    const mainPromptPrefix = '  '.repeat(lineage.ancestors.length);
    printPromptNode(lineage.prompt, mainPromptPrefix);

    // Print descendants
    if (lineage.descendants.length > 0) {
      console.log(chalk.yellow('\nDescendants:'));
      const descendantsPrefix = '  '.repeat(lineage.ancestors.length + 1);
      await printDescendantsTree(lineage.descendants, descendantsPrefix);
    }
  } catch (error) {
    console.error(chalk.red('Failed to show lineage:'), error);
  }
} 