## DigitalEdge Node.js Backend

A minimal **Express**-based Node.js backend initialized in this folder.

### Scripts

- **`npm run dev`**: Start the backend with `nodemon` (auto-restarts on changes).
- **`npm start`**: Start the backend with Node.

### Getting Started

1. **Install dependencies** (already done if you ran the setup):

   ```bash
   npm install
   ```

2. **Configure environment variables**:

   - Copy `.env.example` to `.env` and adjust values if needed:
     ```bash
     cp .env.example .env
     ```

3. **Run in development mode**:

   ```bash
   npm run dev
   ```

4. **Test the server**:

   - Open `http://localhost:4000/health` to see the health check response.
   - Open `http://localhost:4000/api` to see the example API response.

