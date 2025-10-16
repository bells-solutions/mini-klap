# Contributing to MiniKlap

Thank you for your interest in contributing to MiniKlap! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/mini-klap.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages
7. Push to your fork
8. Create a Pull Request

## Development Setup

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

## Code Style

### Backend (NestJS/TypeScript)

- Follow the existing NestJS patterns
- Use dependency injection
- Write descriptive variable and function names
- Add JSDoc comments for complex functions
- Use TypeScript types, avoid `any`

**Example:**
```typescript
@Injectable()
export class VideoService {
  constructor(
    private configService: ConfigService,
    private transcriptionService: TranscriptionService,
  ) {}

  async processVideo(videoId: string): Promise<VideoResponseDto> {
    // Implementation
  }
}
```

### Frontend (Vue.js/TypeScript)

- Use Composition API with `<script setup>`
- Use TypeScript for type safety
- Keep components focused and reusable
- Use Pinia for state management
- Follow Vue.js style guide

**Example:**
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Video } from '@/types/video'

const videos = ref<Video[]>([])
const isLoading = computed(() => videos.value.length === 0)
</script>
```

## Testing

### Backend Tests

```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

### Frontend Tests

```bash
cd frontend
npm run test:unit     # Unit tests
```

### Adding Tests

- Write tests for new features
- Maintain or improve code coverage
- Test edge cases and error handling

## Pull Request Guidelines

### PR Title

Use conventional commit format:
- `feat: Add new feature`
- `fix: Fix bug in video processing`
- `docs: Update README`
- `test: Add tests for highlight service`
- `refactor: Improve video service structure`

### PR Description

Include:
1. What changes were made
2. Why the changes were necessary
3. How to test the changes
4. Screenshots (if UI changes)
5. Related issues (if any)

**Example:**
```markdown
## What
Added support for custom clip durations

## Why
Users requested the ability to create clips longer than 60 seconds

## How to Test
1. Upload a video
2. Set clip duration to 90 seconds in processing options
3. Verify clips are 90 seconds long

## Related Issues
Closes #123
```

## Commit Messages

Write clear, descriptive commit messages:

**Good:**
- ✅ `feat: Add subtitle customization options`
- ✅ `fix: Resolve video upload timeout for large files`
- ✅ `docs: Add API documentation for clip endpoints`

**Bad:**
- ❌ `update code`
- ❌ `fix bug`
- ❌ `changes`

## Areas for Contribution

### High Priority

- [ ] Add video format validation
- [ ] Implement user authentication
- [ ] Add video preview functionality
- [ ] Improve error handling and user feedback
- [ ] Add progress indicators for long operations

### Medium Priority

- [ ] Add more video processing options (filters, effects)
- [ ] Implement clip editing features
- [ ] Add batch processing support
- [ ] Improve mobile responsiveness
- [ ] Add internationalization (i18n)

### Nice to Have

- [ ] Add dark mode
- [ ] Implement clip templates
- [ ] Add social media direct posting
- [ ] Create admin dashboard
- [ ] Add analytics

## Code Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep discussions professional and constructive
4. Be open to feedback

## Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node version, browser, etc.
6. **Screenshots**: If applicable
7. **Logs**: Relevant error logs

**Template:**
```markdown
**Bug Description**
Video upload fails for files larger than 50MB

**Steps to Reproduce**
1. Go to home page
2. Upload a 60MB video file
3. See error

**Expected**
Video should upload successfully (limit is 100MB)

**Actual**
Error: "File too large"

**Environment**
- OS: macOS 14.0
- Browser: Chrome 120
- Node: 20.10.0

**Logs**
```
Error: LIMIT_FILE_SIZE
```

## Feature Requests

For feature requests, include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions considered
4. **Additional Context**: Mockups, examples, etc.

## Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review the documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to MiniKlap! 🎬
