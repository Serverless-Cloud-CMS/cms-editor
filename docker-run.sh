#!/bin/bash

# Function to display usage
usage() {
  echo "Usage: $0 [--mount-source | --build-with-source]"
  exit 1
}

# Parse flags
MOUNT_SOURCE=false
BUILD_WITH_SOURCE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --mount-source)
      MOUNT_SOURCE=true
      shift
      ;;
    --build-with-source)
      BUILD_WITH_SOURCE=true
      shift
      ;;
    *)
      usage
      ;;
  esac
done

if [ "$MOUNT_SOURCE" = true ] && [ "$BUILD_WITH_SOURCE" = true ]; then
  echo "Error: --mount-source and --build-with-source cannot be used together."
  usage
fi

# Determine the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Script directory: $SCRIPT_DIR"

CURRENT_DIR="$(pwd)"
echo "Current directory: $CURRENT_DIR"
# Check if running in the project root (script's parent directory)
PROJECT_ROOT="$SCRIPT_DIR"
if [ "$CURRENT_DIR" != "$PROJECT_ROOT" ]; then
  echo "Error: Please run this script from the project root directory: $PROJECT_ROOT"
  exit 1
fi

# Get the current Git branch name
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ $? -ne 0 ]; then
  echo "Failed to retrieve Git branch name. Ensure this script is run in a Git repository."
  exit 1
fi

# Trap to handle script errors and interruptions
#trap 'echo "Script failed with exit code $?"; exit 1' ERR
#trap 'echo "Script interrupted."; exit 130' INT

# Generate a Docker image name using the Git branch name
IMAGE_NAME="cms-editor:${GIT_BRANCH//\//-}"
echo "Image being used: $IMAGE_NAME"

# Build the Docker image if requested
if [ "$BUILD_WITH_SOURCE" = true ]; then
  echo "Building Docker image with project source ..."
  docker build -t "$IMAGE_NAME" -f docker/Dockerfile  .
else
  echo "Building Docker image without project source..."
  docker build -t "$IMAGE_NAME" --build-arg SCRIPTS_ROOT="./scripts" -f docker/Dockerfile  .
fi

if [ $? -ne 0 ]; then
  echo "Failed to build the Docker image."
  exit 1
fi
cd "$PROJECT_ROOT"

# Define the Docker container name
CONTAINER_NAME="cms-editor-${GIT_BRANCH//\//-}"

# Trap to handle container exit
trap "echo 'Docker container $CONTAINER_NAME has exited.'" EXIT

# Run the Docker container
if [ "$MOUNT_SOURCE" = true ]; then
  echo "Running Docker container with project source mounted..."
  docker run --rm -it \
    --name "$CONTAINER_NAME" \
    -v "$HOME/.aws:/home/node/.aws:ro" \
    -v "$PROJECT_ROOT:/src" \
    -p 3001:3000 \
    "$IMAGE_NAME" /bin/bash
elif [ "$BUILD_WITH_SOURCE" = true ]; then
  echo "Running Docker container with project source built into the image..."
  docker run --rm -it \
    --name "$CONTAINER_NAME" \
    -v "$HOME/.aws:/home/node/.aws:ro" \
    -p 3001:3000 \
    "$IMAGE_NAME" /bin/bash
else # For tests and other commands
  echo "Running Docker container without mounting project source..."
  docker run --rm -it \
    --name "$CONTAINER_NAME" \
    -v "$HOME/.aws:/home/node/.aws:ro" \
    "$IMAGE_NAME"
fi
