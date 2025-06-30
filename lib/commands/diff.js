import { store } from '../db/store.js';
import { createTwoFilesPatch } from 'diff';
import chalk from 'chalk';

/**
 * Compare two prompts and show their differences
 * @param {string} id1 - First prompt ID
 * @param {string} id2 - Second prompt ID
 * @param {Object} options - Command options
 * @param {boolean} options.noColor - Disable colored output
 */
export async function diffPrompts(id1, id2, options = {}) {
  try {
    // Read both prompts
    const prompt1 = await store.getPrompt(id1);
    const prompt2 = await store.getPrompt(id2);

    if (!prompt1 || !prompt2) {
      throw new Error('One or both prompts not found');
    }

    // Create a diff patch
    const patch = createTwoFilesPatch(
      `${id1}.txt`,
      `${id2}.txt`,
      prompt1.prompt,
      prompt2.prompt,
    );

    // If color is disabled, print raw patch
    if (options.noColor) {
      console.log(patch);
      return;
    }

    // Color the output
    const lines = patch.split('\n');
    lines.forEach(line => {
      if (line.startsWith('+')) {
        console.log(chalk.green(line));
      } else if (line.startsWith('-')) {
        console.log(chalk.red(line));
      } else if (line.startsWith('@')) {
        console.log(chalk.cyan(line));
      } else {
        console.log(line);
      }
    });

    // Print metadata comparison
    console.log('\nMetadata Comparison:');
    console.log(chalk.cyan('Created:'));
    console.log(`${id1}: ${new Date(prompt1.created_at).toLocaleString()}`);
    console.log(`${id2}: ${new Date(prompt2.created_at).toLocaleString()}`);
        
    console.log(chalk.cyan('\nModel:'));
    console.log(`${id1}: ${prompt1.model}`);
    console.log(`${id2}: ${prompt2.model}`);

    if (prompt1.tags || prompt2.tags) {
      console.log(chalk.cyan('\nTags:'));
      console.log(`${id1}: ${prompt1.tags?.join(', ') || 'none'}`);
      console.log(`${id2}: ${prompt2.tags?.join(', ') || 'none'}`);
    }
  } catch (error) {
    console.error(chalk.red(`Error comparing prompts: ${error.message}`));
    process.exit(1);
  }
} 