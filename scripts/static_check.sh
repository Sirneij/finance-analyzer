#!/usr/bin/env bash

set -e

# run black - make sure everyone uses same python style
black --skip-string-normalization --line-length 120 --check src/
black --skip-string-normalization --line-length 120 --check run.py
black --skip-string-normalization --line-length 120 --check tests/

# run isort for import structure checkup with black profile
isort --atomic --profile black -c src/
isort --atomic --profile black -c run.py
isort --atomic --profile black -c tests/

# run mypy
mypy src/

# run bandit - A security linter from OpenStack Security
bandit -r src/

# python static analysis
# prospector  --profile=.prospector.yml --path=src --ignore-patterns=static
# prospector  --profile=.prospector.yml --path=tests --ignore-patterns=static