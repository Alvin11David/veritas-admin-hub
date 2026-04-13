#!/bin/bash

while true
do
  # Add all changes
  git add .

  # Check if there is anything to commit
  if ! git diff --cached --quiet
  then
    git commit -m "Auto commit at $(date)"
    git push
  else
    echo "No changes to commit"
  fi

  sleep 2
done