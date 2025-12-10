FROM node:24-bookworm

# Set environment variables
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
ENV TERRAFORM_VERSION="1.12.2"
ENV AWS_CLI_VERSION="2.28.8"
ENV GO_VERSION=1.23.8

# Security Fix
RUN wget https://go.dev/dl/go${GO_VERSION}.linux-arm64.tar.gz && \
    rm -rf /usr/local/go && \
    tar -C /usr/local -xzf go${GO_VERSION}.linux-arm64.tar.gz && \
    rm go${GO_VERSION}.linux-arm64.tar.gz

ENV PATH="/usr/local/go/bin:${PATH}"

# Install dependencies and tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    wget \
    curl \
    less \
    gnupg \
    unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m)-$AWS_CLI_VERSION.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# Install Terraform
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="amd64"; fi && \
    if [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    wget -O terraform.zip "https://releases.hashicorp.com/terraform/$TERRAFORM_VERSION/terraform_${TERRAFORM_VERSION}_linux_${ARCH}.zip" && \
    unzip terraform.zip -d /usr/local/bin && \
    rm -f terraform.zip

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set permissions for the node user to access aws and sam
RUN chown -R node:node /usr/local/aws-cli

# Accept build argument for project root
ARG PROJECT_ROOT=.

# Copy project source if provided
COPY $PROJECT_ROOT /src

# Accept build argument for project root
ARG SCRIPTS_ROOT=./scripts

# Copy project source if provided
COPY $SCRIPTS_ROOT /usr/local/bin

RUN chmod +x /usr/local/bin/*

# Set the working directory
WORKDIR /src

# Expose the application port
EXPOSE 3000

# Use a non-root user
USER node

# Set the entrypoint to print-versions.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
