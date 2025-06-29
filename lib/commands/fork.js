import { savePrompt } from './save.js';
import { store } from '../db/store.js';
import chalk from 'chalk';

export async function forkPrompt(parentId, options) {
  try {
    // Verify parent exists
    const parent = await store.getPrompt(parentId);
    if (!parent) {
      console.error(chalk.red(`Parent prompt with ID ${parentId} not found`));
      return;
    }

    // Add parent ID to options
    const forkOptions = {
      ...options,
      parentId,
      tags: [...(options.tags || []), 'variant']
    };

    // If no prompt is provided, use parent's prompt
    if (!forkOptions.prompt && !forkOptions.file) {
      forkOptions.prompt = parent.prompt;
    }

    // Save the forked prompt
    await savePrompt(forkOptions);
  } catch (error) {
    console.error(chalk.red('Failed to fork prompt:'), error);
  }
} 