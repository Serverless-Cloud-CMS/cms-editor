# CMS Editor

This is a web-based Content Management System (CMS) Editor built with React and TypeScript. It provides a rich text editing experience with support for tables, images, and authentication.

[![BUILD](https://github.com/Serverless-Cloud-CMS/cms-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/Serverless-Cloud-CMS/cms-editor/actions/workflows/ci.yml)

## Features
- Rich text editing
- Table and image support
- User authentication
- AWS CMS CRUD integration
- Modern UI with theming

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn
- Docker (for containerized builds)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd cms-editor
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Running Locally
Start the development server:
```sh
npm run dev
# or
yarn dev
```
The app will be available at `http://localhost:3000` (default Vite port).

## Docker Easy Instructions

### Build and Run Docker Image
To build the Docker image:
```sh
./docker-run.sh --mount-source #Mounts the source for easier development
```

# Docker Manual Instructions

### Run Docker Container
To run the application in a Docker container:
```sh
docker run -p 8080:80 cms-editor
```
The app will be available at `http://localhost:3000`.

### Using Docker Compose (Optional)
If you have a `docker-compose.yml` file, you can use:
```sh
docker-compose up --build
```

## Project Structure
- `src/` - Main source code (components, helpers, editor plugins)
- `public/` - Static assets
- `docker/` - Dockerfile and related scripts
- `scripts/` - Utility scripts

## Testing
Run tests with:
```sh
npm test
# or
yarn test
```

## License
MIT

