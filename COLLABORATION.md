# PromptHub CLI - Team Collaboration Guide

This guide covers the collaboration features of PromptHub CLI, including remote storage, branch management, A/B testing, and CI/CD integration.

## Remote Storage

PromptHub supports three types of remote storage for team collaboration:

### 1. S3 Storage
Best for large teams and high availability.

```bash
# Configure S3
prompthub remote s3 --bucket my-prompts --region us-east-1

# Required environment variables:
S3_BUCKET=your-bucket-name
S3_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 2. GitHub Storage
Best for teams already using GitHub for version control.

```bash
# Configure GitHub
prompthub remote github --repo owner/repo

# Required environment variables:
GITHUB_TOKEN=your-github-token
GITHUB_REPO=owner/repo
```

### 3. REST API Storage
Best for custom backend integration.

```bash
# Configure REST API
prompthub remote rest --url https://api.example.com

# Required environment variables:
REST_API_URL=https://your-api.com
REST_API_KEY=your-api-key
```

## Branch Management

Branches allow teams to work on prompt variations without affecting the main version.

```bash
# Create a new branch
prompthub branch feature/tone --create

# Switch to a branch
prompthub branch feature/tone

# Save to a branch
prompthub save -p "Your prompt" -b feature/tone

# List prompts in a branch
prompthub list -b feature/tone

# Search in a branch
prompthub search "query" -b feature/tone
```

## A/B Testing

Built-in A/B testing helps teams compare prompt variations:

```bash
# Basic A/B test
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
- Comparison metrics

## Prompt Metadata Schema

PromptHub uses a structured schema for clean diffs and better collaboration:

```json
{
  "id": "abc123",
  "prompt": "Your prompt text",
  "response": "Model response",
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

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
# .github/workflows/prompts.yml
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

## Team Workflows

### 1. Feature Development
```bash
# Create feature branch
prompthub branch feature/new-tone --create

# Save base prompt
prompthub save -p "Base prompt" -t base

# Create variants
prompthub fork abc123 -p "Variant A"
prompthub fork abc123 -p "Variant B"

# Test variants
prompthub test def456 ghi789 -n 10 -o results.csv

# Review changes
prompthub lineage abc123
prompthub check-outdated
```

### 2. Prompt Review Process
1. Developer creates feature branch
2. Saves prompt variations
3. Runs A/B tests
4. Team reviews results
5. Merges successful variants

### 3. Continuous Integration
1. Automated testing on push
2. Performance metrics tracking
3. Outdated prompt detection
4. Results export for review

## Best Practices

### 1. Branch Management
- Use descriptive branch names
- One branch per feature/experiment
- Regular outdated checks
- Clean up old branches

### 2. A/B Testing
- Test with sufficient samples
- Use production model settings
- Export results for analysis
- Document test conditions

### 3. Remote Storage
- Regular synchronization
- Clear access controls
- Backup strategy
- Clean storage structure

### 4. Metadata Management
- Consistent schema usage
- Complete test results
- Clear metrics tracking
- Proper versioning

### 5. CI/CD Pipeline
- Automated testing
- Performance tracking
- Regular validation
- Clear reporting

## Integration Examples

### 1. With PromptLayer
```bash
# Export test results
prompthub test abc123 def456 -o promptlayer-import.csv
```

### 2. With LangSmith
```bash
# Track prompt chains
prompthub lineage abc123 --format json > langsmith-import.json
```

### 3. With APIWrapper.ai
```bash
# CI/CD integration
prompthub test abc123 def456 --ci-mode --api-wrapper
```

## Troubleshooting

### Common Issues

1. **Remote Storage**
   - Check credentials
   - Verify permissions
   - Test connectivity
   - Check storage limits

2. **Branch Management**
   - Resolve conflicts
   - Clean old branches
   - Fix merge issues
   - Update references

3. **A/B Testing**
   - API rate limits
   - Model availability
   - Result consistency
   - Export format

## Support

Need help with collaboration features?
- GitHub Issues: [Report here](https://github.com/sagarregmi2056/prompthub-cli/issues)
- Documentation: [Read more](https://github.com/sagarregmi2056/prompthub-cli/wiki)
- Examples: [See examples](https://github.com/sagarregmi2056/prompthub-cli/examples) 