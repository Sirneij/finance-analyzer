I want to write an article about how to build AI-powered financial data analyzer using NodeJS, Python (PyTorch, aiohttp, and Huggingface transformers), SvelteKit (with Websocket support) and Tailwind CSS v4. Modify this script to generate a PNG banner for the post using the technologies' logos.

The architecture of the application is that SvelteKit (with svelte 5 and tailwindcss v4) consumes REST apis from NodeJS.

NodeJS (using expressjs) is the backbone of the application with the following responsibilities:

1. Authenticating users via OAuth (GitHub and Google, only GitHub has been implemented for now) and storing their basic information in a MongoDB database.
2. Provides REST APIs for parsing transaction data (in CSV, PDF and Excel formats, excel still under development) and storing the parsed data in the database.
3. Serves as a middleman that sends users data to a Python server which analyzes the data and return the analyzed data back to NodeJS which in turn sends them to the frontend. This middleman role is needed since NodeJS needs to authenticate users and filter transactions based on that before analysis. Websocket is used for this communication.

The `aiohttp` backed Python server does very specific things:

1. Using `pdf2image` and `pytesseract`, parse a PDF which has transaction data and send them back to NodeJS to save in the DB (http communication)
2. Using `PyTorch`, `transformers`, `numpy`, `pandas` and `sklearn`, analyze transaction data by categorizing them as income/expenses, calculating savings rate, total transactions and so on and sending the result back to NodeJS which in turn sends it (without saving) to the frontend via Websockets.

SvelteKit frontend:

1. Powered by svelte 5, it allows user registration via GitHub (for now), a requirement for all users.
2. Provides intuitive interface for users to either upload a file or manually input data in a form.
3. Using chartjs, provides very interactive charts for users based on their transaction data and provides a very nice and intuitive dashboard for user's displaying financial data and charts in very fancy ways.
