### **AI-Powered Financial Behavior Analyzer API**

---

#### **Overview**

The AI-Powered Financial Behavior Analyzer API is a backend service designed to analyze financial behavior patterns using modern web technologies. The app is built with **TypeScript**, **Node.js**, and **Express**, ensuring scalability, maintainability, and type safety. The app integrates **MongoDB** for data persistence and supports authentication via **Google** and **GitHub** using **Passport.js**.

---

#### **Features**

- **User Authentication**:
  - Authentication via **Google** and **GitHub** using **Passport.js**
  - Secure session management
- **Data Analysis**:
  - Analyze financial behavior data (expandable functionality)
- **Modular Design**:
  - Clearly defined services, controllers, and routes for better maintainability

---

#### **Requirements**

- **Node.js**: v20+
- **TypeScript**: v5+
- **MongoDB**: Database for storing user and financial data

---

#### **Setup**

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/ai-financial-analyzer.git
   cd ai-financial-analyzer
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the project root and add the following:

   ```env
   DB_URI=your-mongodb-uri
   DB_NAME=your-database-name
   PORT=your-port
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   SESSION_SECRET=your-session-secret
   ```

4. **Run the application**:

   - **Development mode**:
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm run build
     npm start
     ```

5. **Run tests**:
   ```bash
   npm test
   ```

---

#### **API Endpoints**

| Method | Endpoint               | Description                 |
| ------ | ---------------------- | --------------------------- |
| GET    | `/api/v1/auth/session` | Get a specific user         |
| POST   | `/api/v1/auth/login`   | Login with Google or GitHub |
| GET    | `/api/v1/auth/logout`  | Logout the user             |

---

#### **Technologies Used**

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Static typing
- **MongoDB**: NoSQL database
- **Passport.js**: Authentication middleware
- **Jest**: Testing framework
- **ESLint & Prettier**: Linting and formatting

---

#### **License**

This project is licensed under the MIT License.
