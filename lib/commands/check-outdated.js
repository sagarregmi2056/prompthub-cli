import { store } from '../db/store.js';
import chalk from 'chalk';

export async function checkOutdated() {
  try {
    const outdated = await store.checkOutdated();
    
    if (outdated.length === 0) {
      console.log(chalk.green('✓ All prompts are up to date!'));
      return;
    }

    console.log(chalk.yellow(`\n⚠️  Found ${outdated.length} outdated prompt${outdated.length === 1 ? '' : 's'}:`));
    
    outdated.forEach(({ prompt, parent, reason }) => {
      console.log('\n' + chalk.yellow(`• ${prompt.id} (child of ${parent.id})`));
      console.log('  ' + chalk.gray(`Parent updated: ${parent.created_at}`));
      console.log('  ' + chalk.gray(`Variant created: ${prompt.created_at}`));
      console.log('  ' + chalk.gray(`Reason: ${reason}`));
      
      // Show prompt previews
      console.log('  ' + chalk.white('\nParent prompt:'));
      console.log('  ' + chalk.cyan(`"${parent.prompt.slice(0, 100)}${parent.prompt.length > 100 ? '...' : ''}"`));
      console.log('  ' + chalk.white('\nVariant prompt:'));
      console.log('  ' + chalk.cyan(`"${prompt.prompt.slice(0, 100)}${prompt.prompt.length > 100 ? '...' : ''}"`));
    });

    console.log('\n' + chalk.yellow('To update a prompt, create a new variant from the parent using:'));
    console.log(chalk.cyan('prompthub fork <parent-id> --prompt "..."'));
  } catch (error) {
    console.error(chalk.red('Failed to check for outdated prompts:'), error);
  }
} 