# PromptHub CLI

A powerful version control system for AI prompts, allowing you to track, compare, and manage your prompt engineering history. Uses a simple file-based storage system with optional remote storage for team collaboration.

## Features

- 📝 Save and version control your prompts
- 🔍 Search through prompt history
- 🔄 Compare different versions of prompts
- 🏷️ Tag and categorize prompts
- 📊 Track prompt performance and responses
- 🔙 Rollback to previous versions
- 🌳 Track prompt lineage and variants
- 🔔 Detect outdated prompt variants
- 🤝 Team collaboration with remote storage
- 🧪 Built-in A/B testing
- 🔀 Branch-based workflow
- 🚀 CI/CD integration support
- 💾 Local or remote storage options
- 📤 Human-readable JSON storage format
- 🤖 Support for multiple AI providers

## Storage Structure

```
.prompthub/
├── config.yml           # Configuration file
├── prompts/            # Directory containing all prompts
│   ├── abc123.json    # Individual prompt files
│   ├── def456.json
│   └── ...
└── tags.json          # Tag to prompt ID mappings
```

### Prompt File Format (abc123.json)
```json
{
  "id": "abc123",
  "prompt": "Explain quantum computing",
  "response": "Quantum computing is...",
  "model": "gpt-4",
  "created_at": "2024-02-20T12:34:56.789Z",
  "parent_id": null,
  "branch": "main",
  "metadata": {
    "executed": true,
    "source": "cli",
    "metrics": {
      "tokens": 150,
      "latency": 2500,
      "cost": 0.03
    },
    "test_results": [
      {
        "timestamp": "2024-02-20T12:35:00Z",
        "comparison_id": "test123",
        "metrics": {
          "accuracy": 0.95,
          "latency": 2500,
          "tokens": 150
        }
      }
    ],
    "ci": {
      "pipeline": "prompt-validation",
      "run_id": "ci123",
      "status": "passed"
    }
  }
}
```

### Tags File Format (tags.json)
```json
{
  "quantum": ["abc123", "def456"],
  "physics": ["abc123"],
  "ai": ["ghi789"],
  "variant": ["def456"]
}
```

## Supported AI Models

The CLI supports multiple AI model providers:

### OpenAI (Default)
- Models: gpt-4, gpt-3.5-turbo
- Requirements: OPENAI_API_KEY
- Best for: General purpose, high-quality completions

### LLaMA
- Models: llama-2-7b, llama-2-13b, llama-2-70b
- Requirements: LLAMA_API_URL, LLAMA_API_KEY
- Best for: Self-hosted or custom deployments

### Anthropic
- Models: claude-3-opus, claude-3-sonnet
- Requirements: ANTHROPIC_API_KEY
- Best for: Long-form content, analysis tasks

## Installation

### For Users

```bash
# Install globally from npm
npm install -g @sagarregmi2056/prompthub-cli

# Or install from source
git clone https://github.com/sagarregmi2056/prompthub-cli.git
cd prompthub-cli
npm install
npm link
```

### For Developers

```bash
# Clone the repository
git clone https://github.com/sagarregmi2056/prompthub-cli.git

# Navigate to the project directory
cd prompthub-cli

# Install dependencies
npm install

# Link the CLI globally for testing
npm link

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## Configuration

### Required Environment Variables

The CLI requires configuration for basic operation and remote storage. When you first run any command, if no `.env` file is found, a template will be created automatically:

```env
# Required for prompt execution
OPENAI_API_KEY=your_api_key_here

# Optional: Remote storage configuration
# S3 Storage
S3_BUCKET=your-bucket-name
S3_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# GitHub Storage
GITHUB_TOKEN=your-github-token
GITHUB_REPO=owner/repo

# REST API Storage
REST_API_URL=https://your-api.com
REST_API_KEY=your-api-key

# Model Configuration
MODEL=gpt-4  # Default model to use
MAX_TOKENS=2000  # Maximum tokens for responses
```

### Remote Storage Setup

PromptHub supports three types of remote storage:

1. **S3 Storage**
```bash
# Configure S3
prompthub remote s3 --bucket my-prompts --region us-east-1

# Required environment variables:
# - S3_BUCKET
# - S3_REGION
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
```

2. **GitHub Storage**
```bash
# Configure GitHub
prompthub remote github --repo owner/repo

# Required environment variables:
# - GITHUB_TOKEN
# - GITHUB_REPO
```

3. **REST API Storage**
```bash
# Configure REST API
prompthub remote rest --url https://api.example.com

# Required environment variables:
# - REST_API_URL
# - REST_API_KEY
```

## Usage

### Initialize in a Project

```bash
prompthub init
```

### Branch Management

```bash
# Create a new branch
prompthub branch feature/tone --create

# Switch to a branch
prompthub branch feature/tone

# List prompts in a branch
prompthub list -b feature/tone
```

### Save a Prompt

```bash
# Save a prompt directly
prompthub save -p "Explain quantum computing" -t quantum physics

# Save to a specific branch
prompthub save -p "Your prompt" -b feature/tone

# Save a prompt from a file
prompthub save -f ./prompt.txt --tags ai research

# Save without executing
prompthub save -p "Your prompt" --no-execute

# Save without checking for outdated prompts
prompthub save -p "Your prompt" --skip-outdated-check
```

### Create Prompt Variants

```bash
# Fork a prompt with new text
prompthub fork abc123 -p "Explain quantum computing with more examples"

# Fork using parent's prompt text
prompthub fork abc123

# Fork with additional tags
prompthub fork abc123 -t advanced examples

# Fork from file
prompthub fork abc123 -f ./variant.txt
```

### A/B Testing

```bash
# Simple A/B test
prompthub test abc123 def456

# Run multiple samples
prompthub test abc123 def456 -n 10

# Test with specific model
prompthub test abc123 def456 --model gpt-4

# Export results to CSV
prompthub test abc123 def456 -n 5 -o results.csv
```

The CSV output includes:
- Prompt IDs and text
- Average token usage
- Average latency
- Sample responses

### Track Prompt Lineage

```bash
# Show full ancestry tree of a prompt
prompthub lineage abc123

# Check for outdated prompts
prompthub check-outdated
```

### List and Search

```bash
# List prompts in current branch
prompthub list

# List with limit
prompthub list -n 20

# List prompts with specific tag
prompthub list -t research

# List prompts in specific branch
prompthub list -b feature/tone

# Search in specific branch
prompthub search "quantum" -b feature/tone

# Output in JSON format
prompthub list --format json
```

### Compare and Restore

```bash
# Show diff between two versions
prompthub diff abc123 def456

# Restore to specific branch
prompthub restore abc123 -b feature/tone
```

## Team Collaboration Workflow

1. **Set Up Remote Storage**
```bash
# Team lead configures remote storage
prompthub remote s3 --bucket team-prompts --region us-east-1
```

2. **Create Feature Branch**
```bash
# Create branch for new feature
prompthub branch feature/tone-improvement --create
```

3. **Work on Prompts**
```bash
# Save prompts to branch
prompthub save -p "New tone prompt" -b feature/tone-improvement

# Test variations
prompthub fork abc123 -p "Alternative tone" -b feature/tone-improvement
prompthub test def456 ghi789 -n 5 -o tone-test.csv
```

4. **Review Changes**
```bash
# Check for outdated prompts
prompthub check-outdated

# Review lineage
prompthub lineage abc123
```

## CI/CD Integration

PromptHub CLI can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Prompt Validation
on: [push]

jobs:
  validate-prompts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install PromptHub CLI
        run: npm install -g @sagarregmi2056/prompthub-cli
      
      - name: Run A/B Tests
        run: |
          prompthub test ${{ github.event.inputs.prompt1 }} ${{ github.event.inputs.prompt2 }} -n 5 -o test-results.csv
      
      - name: Check Outdated Prompts
        run: prompthub check-outdated
```

## Best Practices

1. **Branch Management**
   - Use branches for experimental prompt variations
   - Keep main branch for production-ready prompts
   - Test variations before merging

2. **A/B Testing**
   - Run multiple samples for statistical significance
   - Export results to CSV for analysis
   - Test with the same model you'll use in production

3. **Remote Storage**
   - Use S3 for large teams and high availability
   - Use GitHub for version control integration
   - Use REST API for custom backend integration

4. **Prompt Lineage**
   - Fork prompts for significant variations
   - Keep track of parent-child relationships
   - Regularly check for outdated variants

5. **CI/CD Integration**
   - Automate prompt testing
   - Validate prompts before deployment
   - Track metrics over time

## Command Reference

- `prompthub init` - Initialize prompt version control in current directory
- `prompthub save` - Save a new prompt version
  - `-p, --prompt <string>` - Prompt text
  - `-f, --file <path>` - Load prompt from file
  - `-m, --model <string>` - AI model to use (default: gpt-4)
  - `-t, --tags <tags...>` - Tags for the prompt
  - `--no-execute` - Save prompt without executing
- `prompthub list` - List saved prompts
  - `-n, --limit <number>` - Number of prompts to show
  - `-t, --tag <tag>` - Filter by tag
  - `--format <format>` - Output format (table|json)
- `prompthub search <query>` - Search prompts
  - `--in <field>` - Search in specific field (prompt|response|tags)
- `prompthub diff <id1> <id2>` - Show differences between prompt versions
  - `--no-color` - Disable colored output
- `prompthub restore <id>` - Restore a previous prompt version
  - `-o, --output <file>` - Output file

## Development

### Project Structure

```
prompthub-cli/
├── bin/
│   └── cli.js              # CLI entry point
├── lib/
│   ├── commands/           # Command implementations
│   │   ├── save.js
│   │   ├── list.js
│   │   ├── search.js
│   │   ├── diff.js
│   │   └── restore.js
│   ├── db/                 # Storage handling
│   │   └── store.js
│   └── utils/             # Utility functions
│       ├── config.js
│       └── id.js
├── .env                    # Environment variables
└── package.json
```

### Adding New Commands

1. Create a new command file in `lib/commands/`
2. Export the command function
3. Add the command to `lib/commands/index.js`
4. Register the command in `bin/cli.js`

Example:
```javascript
// lib/commands/yourcommand.js
export async function yourCommand(options) {
  // Implementation
}

// lib/commands/index.js
export { yourCommand } from './yourcommand.js';

// bin/cli.js
program
  .command('yourcommand')
  .description('Your command description')
  .option('-o, --option', 'Option description')
  .action(yourCommand);
```

### Storage System

The file-based storage system is implemented in `lib/db/store.js`. Key features:

- Each prompt is stored as a separate JSON file
- Files are named using the prompt ID (e.g., `abc123.json`)
- Tags are stored in a central `tags.json` file
- All storage is human-readable and easily inspectable
- No database dependencies required

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Developers

### Lead Developer
- **Sagar Regmi**
  - GitHub: [@sagarregmi2056](https://github.com/sagarregmi2056)
  - Role: Project Lead & Core Developer

### Contact & Support
- For bugs and feature requests, please [open an issue](https://github.com/sagarregmi2056/prompthub-cli/issues)
- For security concerns, please email sagarregmi2056@gmail.com
- For other inquiries, reach out to sagarregmi2056@gmail.com

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure your `.env` file exists and contains the correct API key
   - Check that the API key has sufficient permissions
   - Verify you're using the correct environment variable name for your chosen provider

2. **Command Not Found**
   - Run `npm link` to create the global command
   - Ensure your npm global bin directory is in your PATH
   - Try reinstalling the package: `npm install -g @sagarregmi2056/prompthub-cli`

3. **Permission Errors**
   - Check file permissions in your project directory
   - Ensure you have write access to the `.prompthub` directory
   - For global installation issues, try using `sudo` (Linux/Mac) or run as administrator (Windows)

4. **Model-Specific Issues**
   - OpenAI: Verify API key and model access
   - LLaMA: Check API endpoint connectivity
   - Anthropic: Ensure API key and model permissions

### Debug Mode

Enable debug logging for more detailed output:

```bash
# Unix/Mac
DEBUG=prompthub* prompthub save -p "Your prompt"

# Windows
set DEBUG=prompthub* && prompthub save -p "Your prompt"
```

### Version History

- v1.0.7 (2025-06)
  - Initial release
  - Support for OpenAI, LLaMA, and Anthropic models
  - Basic prompt version control features

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community
- Built with inspiration from git and other version control systems

## Roadmap

- [ ] Add support for more LLM providers
- [ ] Implement prompt templating system
- [ ] Add collaborative features
- [ ] Create web interface
- [ ] Add analytics dashboard
- [ ] Implement prompt chaining
- [ ] Add support for fine-tuning workflows

---
Built with ❤️ by [Sagar Regmi](https://github.com/sagarregmi2056)
