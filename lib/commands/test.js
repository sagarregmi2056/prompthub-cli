import { store } from '../db/store.js';
import { OpenAI } from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import { createObjectCsvWriter } from 'csv-writer';
import { generateId } from '../utils/id.js';

let client = null;

const initializeOpenAI = () => {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
};

async function runTest(prompt, model, samples = 1) {
  const openai = initializeOpenAI();
  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < samples; i++) {
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const endTime = Date.now();
    results.push({
      response: completion.choices[0].message.content,
      tokens: completion.usage.total_tokens,
      latency: endTime - startTime,
    });
  }

  return results;
}

export async function testPrompts(promptId1, promptId2, options) {
  const spinner = ora('Loading prompts...').start();
  
  try {
    // Load prompts
    const prompt1 = await store.getPrompt(promptId1);
    const prompt2 = await store.getPrompt(promptId2);

    if (!prompt1 || !prompt2) {
      throw new Error('One or both prompts not found');
    }

    spinner.text = 'Running A/B tests...';

    // Run tests
    const samples = options.samples || 1;
    const [results1, results2] = await Promise.all([
      runTest(prompt1.prompt, options.model, samples),
      runTest(prompt2.prompt, options.model, samples),
    ]);

    // Calculate metrics
    const metrics1 = {
      avg_tokens: results1.reduce((sum, r) => sum + r.tokens, 0) / samples,
      avg_latency: results1.reduce((sum, r) => sum + r.latency, 0) / samples,
    };

    const metrics2 = {
      avg_tokens: results2.reduce((sum, r) => sum + r.tokens, 0) / samples,
      avg_latency: results2.reduce((sum, r) => sum + r.latency, 0) / samples,
    };

    // Save test results
    const testId = generateId();
    const timestamp = new Date().toISOString();

    const testResults = {
      timestamp,
      comparison_id: testId,
      metrics: {
        tokens: metrics1.avg_tokens,
        latency: metrics1.avg_latency,
      },
    };

    // Update both prompts with test results
    await store.updatePromptMetadata(promptId1, {
      test_results: [...(prompt1.metadata.test_results || []), testResults],
    });

    await store.updatePromptMetadata(promptId2, {
      test_results: [...(prompt2.metadata.test_results || []), {
        ...testResults,
        metrics: {
          tokens: metrics2.avg_tokens,
          latency: metrics2.avg_latency,
        },
      }],
    });

    // Export results to CSV
    if (options.output) {
      const csvWriter = createObjectCsvWriter({
        path: options.output,
        header: [
          { id: 'prompt_id', title: 'Prompt ID' },
          { id: 'prompt', title: 'Prompt Text' },
          { id: 'avg_tokens', title: 'Avg Tokens' },
          { id: 'avg_latency', title: 'Avg Latency (ms)' },
          { id: 'sample_responses', title: 'Sample Responses' },
        ],
      });

      await csvWriter.writeRecords([
        {
          prompt_id: promptId1,
          prompt: prompt1.prompt,
          avg_tokens: metrics1.avg_tokens,
          avg_latency: metrics1.avg_latency,
          sample_responses: results1.map(r => r.response).join('\n---\n'),
        },
        {
          prompt_id: promptId2,
          prompt: prompt2.prompt,
          avg_tokens: metrics2.avg_tokens,
          avg_latency: metrics2.avg_latency,
          sample_responses: results2.map(r => r.response).join('\n---\n'),
        },
      ]);
    }

    spinner.succeed('A/B test completed!');

    // Display results
    console.log('\nResults:');
    console.log('\nPrompt 1:', chalk.cyan(promptId1));
    console.log('Avg Tokens:', chalk.yellow(metrics1.avg_tokens.toFixed(2)));
    console.log('Avg Latency:', chalk.yellow(metrics1.avg_latency.toFixed(2)), 'ms');
    
    console.log('\nPrompt 2:', chalk.cyan(promptId2));
    console.log('Avg Tokens:', chalk.yellow(metrics2.avg_tokens.toFixed(2)));
    console.log('Avg Latency:', chalk.yellow(metrics2.avg_latency.toFixed(2)), 'ms');

    if (options.output) {
      console.log('\nDetailed results exported to:', chalk.green(options.output));
    }

  } catch (error) {
    spinner.fail('Test failed');
    console.error(chalk.red('Error:'), error.message);
  }
} 