# PromptHub CLI

A powerful version control system for AI prompts, allowing you to track, compare, and manage your prompt engineering history. Uses a simple file-based storage system - no database required!

## Features

- 📝 Save and version control your prompts
- 🔍 Search through prompt history
- 🔄 Compare different versions of prompts
- 🏷️ Tag and categorize prompts
- 📊 Track prompt performance and responses
- 🔙 Rollback to previous versions
- 💾 Simple file-based storage (no database required)
- 📤 Human-readable JSON storage format
- 🤖 Support for multiple AI providers (OpenAI, LLaMA, Anthropic)

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
  "metadata": {
    "executed": true,
    "source": "cli"
  }
}
```

### Tags File Format (tags.json)
```json
{
  "quantum": ["abc123", "def456"],
  "physics": ["abc123"],
  "ai": ["ghi789"]
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

The CLI requires an OpenAI API key to function. When you first run any command, if no `.env` file is found, a template will be created automatically. You'll need to edit this file and add your API key:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
MODEL=gpt-4  # Default model to use
MAX_TOKENS=2000  # Maximum tokens for responses
```

To get an OpenAI API key:
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Create a new API key
4. Copy the key and paste it in your `.env` file

### Configuration Files

The CLI uses two main configuration files:

1. `.env` - Environment variables (API keys, model settings)
2. `.prompthub/config.yml` - CLI configuration (created automatically)

The first time you run any command:
- If no `.env` file exists, a template will be created
- A `.prompthub` directory will be created containing:
  - `config.yml` - Configuration settings
  - `prompts/` - Directory for storing prompts
  - `tags.json` - Tag management file

### Model Provider Setup

1. Choose your model provider in `.env`:
```env
# Set your preferred provider (OPENAI, LLAMA, ANTHROPIC)
MODEL_PROVIDER=OPENAI

# Configure provider-specific settings
# For OpenAI:
OPENAI_API_KEY=your_openai_api_key_here
MODEL=gpt-4  # Optional

# For LLaMA:
# MODEL_PROVIDER=LLAMA
# LLAMA_API_URL=your_llama_api_url_here
# LLAMA_API_KEY=your_llama_api_key_here
# MODEL=llama-2-7b

# For Anthropic:
# MODEL_PROVIDER=ANTHROPIC
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# MODEL=claude-3-opus
```

2. Provider-Specific Setup:

#### OpenAI
1. Get API key from https://platform.openai.com/api-keys
2. Set OPENAI_API_KEY in .env

#### LLaMA
1. Set up a LLaMA API endpoint (self-hosted or service)
2. Configure LLAMA_API_URL and LLAMA_API_KEY
3. Optional: Choose model variant in MODEL

#### Anthropic
1. Get API key from Anthropic
2. Set ANTHROPIC_API_KEY in .env
3. Optional: Choose Claude model in MODEL

## Usage

### Initialize in a Project

```bash
prompthub init
```

### Save a Prompt

```bash
# Save a prompt directly
prompthub save -p "Explain quantum computing" -t quantum physics

# Save a prompt from a file
prompthub save -f ./prompt.txt --tags ai research

# Save without executing
prompthub save -p "Your prompt" --no-execute
```

### List Prompts

```bash
# List recent prompts
prompthub list

# List with limit
prompthub list -n 20

# List prompts with specific tag
prompthub list -t research

# Output in JSON format
prompthub list --format json
```

### Search Prompts

```bash
# Search in prompts
prompthub search "quantum"

# Search in specific field
prompthub search "error" --in response

# Search by tag
prompthub search "ai" --in tags
```

### Compare Versions

```bash
# Show diff between two versions
prompthub diff abc123 def456

# Show diff without color
prompthub diff abc123 def456 --no-color
```

### Restore Version

```bash
# Restore a previous version
prompthub restore abc123 -o prompt.txt

# View a previous version without restoring
prompthub restore abc123
```

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

- v1.0.0 (2024-02)
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