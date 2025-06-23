#!/bin/bash

echo "Terraform version:"
terraform version 2>/dev/null || echo "Terraform not found"

echo
echo "AWS CLI version:"
aws --version 2>/dev/null || echo "AWS CLI not found"

echo
echo "Python version:"
python3 --version 2>/dev/null || echo "Python3 not found"

echo
echo "Git branch:"
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
echo "${GIT_BRANCH:-Not a git repository}"

echo
echo "Node.js version:"
node --version 2>/dev/null || echo "Node.js not found"



# Backup the existing .bashrc file
BASHRC_FILE="$HOME/.bashrc"
BACKUP_FILE="$HOME/.bashrc.bak"

if [ -f "$BASHRC_FILE" ]; then
  echo "Backing up existing .bashrc to .bashrc.bak..."
  cp "$BASHRC_FILE" "$BACKUP_FILE"
fi

if [ -n "$GIT_BRANCH" ]; then
  # Define the new PS1 value
  NEW_PS1="[\u@$GIT_BRANCH \W]\$ "
else
  # Define the new PS1 value without branch
  NEW_PS1='[\u \W]\$ '
fi
# Check if PS1 is already set in .bashrc
if grep -q "export PS1=" "$BASHRC_FILE"; then
  echo "Updating existing PS1 in .bashrc..."
  sed -i '' "s|^export PS1=.*|export PS1='$NEW_PS1'|" "$BASHRC_FILE"
else
  echo "Adding new PS1 to .bashrc..."
  echo "export PS1='$NEW_PS1'" >> "$BASHRC_FILE"
fi


# Execute the arguments passed
if [ $# -gt 0 ]; then
  echo "Executing commandx: $*"
  "$@"
else
  echo "No command provided to execute."
fi