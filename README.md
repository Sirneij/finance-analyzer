[![GitHub Actions](https://github.com/Sirneij/finance-analyzer/actions/workflows/aiohttp.yml/badge.svg)](https://github.com/Sirneij/finance-analyzer/actions)
[![codecov](https://codecov.io/github/Sirneij/finance-analyzer/branch/utility/graph/badge.svg?token=YW6QCWDAGI)](https://codecov.io/github/Sirneij/finance-analyzer)
[![Python Version](https://img.shields.io/badge/python-3.13-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![Imports: isort](https://img.shields.io/badge/%20imports-isort-%231674b1?style=flat&labelColor=ef8336)](https://pepy.tech/project/isort)

# Utility

Utility is a collection of asynchronous tools for resume processing and real-time transaction communication. It provides robust parsers to transform raw resume file into structured JSON-like data and a WebSocket interface for live analysis and summary of financial transaction data.

## Features

- **Resume Parsing:**  
  Extracts structured information from raw resume (in PDF), including:

  - Contact details (name, phone, email, etc.)
  - Professional summary
  - Key skills
  - Work experiences (with achievements and technology stacks)
  - Education details (with achievements)

- **WebSocket Communication:**  
  Implements a WebSocket handler that supports:

  - Real-time transactions analysis (via an `'analyze'` action)
  - Real-time transactions summarization (via a `'summary'` action)
  - Ping/pong mechanisms for connection health
  - Error handling for message processing

- **Asynchronous Design:**  
  Built using `asyncio` and `aiohttp` to ensure high performance and responsiveness.

- **Robust Testing:**  
  Comprehensive test suites (using `unittest` and aiohttp test tools) verify all core functionalities:
  - Resume and education parsing logic
  - WebSocket communication, including various action workflows and error conditions

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone -b utility https://github.com/Sirneij/finance-analyzer.git utility
   cd utility
   ```
2. **Set Up the Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.dev.txt
   ```
3. **Run the Tests:**
   ```bash
   coverage run --parallel-mode -m unittest discover tests && coverage combine && coverage report && coverage html
   ```
