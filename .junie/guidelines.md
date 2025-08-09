# Project Guidelines
This is a Editor using Lexical and  React as the core frameworks.

# Project Structure
- TypeScript for type safety and modern JavaScript features.
- React for building user interfaces.
- Lexical for rich text editing capabilities.
- Uses a Data Service factory pattern to manage data operations.
- The project is structured to separate concerns, making it easier to maintain and extend.
- Vite build and development tool.
- Uses ESLint and Prettier for code quality and formatting.
- Uses Vitest for unit testing.

# Code Style
- Follow the Airbnb JavaScript Style Guide.
- Use TypeScript for type annotations and interfaces.
- Use functional components and hooks in React.
- Use camelCase for variable and function names.
- Use PascalCase for component names.
- Use single quotes for strings, except when using template literals.
- Use semicolons at the end of statements.
- Use spaces for indentation (2 spaces).

# Commit Messages
- Use the conventional commits format.
- Use the following structure:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding missing or correcting existing tests
  - `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation
  - `revert`: Reverts a previous commit
  - `build`: Changes that affect the build system or external dependencies
  - `ci`: Changes to our CI configuration files and scripts

# Testing
- Use Vitest for unit testing.
- Write tests for all new features and bug fixes.
- Use the Arrange-Act-Assert (AAA) pattern for writing tests.
- Use `describe` blocks to group related tests.
- Use `it` blocks for individual test cases.
- Use `beforeEach` and `afterEach` hooks for setup and teardown.
- Use `expect` for assertions.
- Use `mock` and `spy` for mocking and spying on functions.
- Use `snapshot` testing for components where applicable.
- Run tests before committing code.
- Use code coverage tools to ensure sufficient test coverage.
- Aim for at least 80% code coverage.
- Use `vitest --coverage` to generate coverage reports.

# Documentation
- Use JSDoc comments for documenting functions and components.
- Use Markdown for README and other documentation files.
- Keep documentation up to date with code changes.
- Use clear and concise language in documentation.
- Use examples in documentation where applicable.
- Use a consistent format for documentation.
- Use headings and subheadings to organize documentation.
- Use code blocks for code examples.
- Use lists for enumerated or bulleted items.
- Use links to reference related documentation or resources.
- Use images or diagrams where applicable to illustrate concepts.
- Use a table of contents for longer documentation files.
- Use a changelog to document changes to the project.
- Use a CONTRIBUTING.md file to document how to contribute to the project.
- Use a LICENSE file to document the project's license.
- Use a CODE_OF_CONDUCT.md file to document the project's code of conduct.
- Use a SECURITY.md file to document the project's security practices.

# Version Control
- Use Git for version control.
- Use branches for new features and bug fixes.
- Use pull requests for code reviews and merging changes.
- Use descriptive branch names that reflect the feature or bug fix.
- Use the `main` branch for production-ready code.
- Use 'trunk-based development' for continuous integration and deployment.
- Use `git rebase` for keeping branches up to date with the main branch.
- Use `git merge` for merging branches into the main branch.
- Use Semantic versioning when making changes.
- Increment versioning based on the type of change:
  - Patch: for bug fixes
  - Minor: for new features
  - Major: for breaking changes
- Use a `CHANGELOG.md` file to document changes to the project.
- Use a `package.json` file to manage project dependencies.
- Increment the Package.json version number when making changes.

# Deployment
- Use Vite for building the project.
- Use a CI/CD pipeline for automated deployment.
- Use environment variables for configuration.
- Use a `.env` file for local development configuration.
- Use a `Dockerfile` for containerization.

# Security
- Use HTTPS for secure communication.
- Use environment variables for sensitive information.
- Use a `.env.example` file to document required environment variables.
- Use a `.gitignore` file to exclude sensitive files from version control.
- Use security best practices for handling user input.
- Use libraries and frameworks that are actively maintained and have a good security track record.
- Regularly update dependencies to their latest versions.
- Use static code analysis tools to identify security vulnerabilities.
- Use dependency scanning tools to identify known vulnerabilities in dependencies.


