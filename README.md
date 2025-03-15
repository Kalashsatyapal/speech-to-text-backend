# Speech-to-Text Transcription API - backend

This project is a backend API for transcribing audio files using AssemblyAI and storing transcriptions in Supabase. It is built with Node.js, Express, and Supabase.

## Features
- Upload and transcribe audio files using AssemblyAI.
- Store transcriptions in Supabase.
- Fetch all transcriptions.
- Delete individual or all transcriptions.

## Tech Stack
- Node.js
- Express.js
- Multer (for file uploads)
- AssemblyAI API (for speech-to-text conversion)
- Supabase (for database storage)

## Installation & Setup

### Prerequisites
- Node.js installed
- A Supabase account with a database set up
- An AssemblyAI API key

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/speech-to-text-api.git
   cd speech-to-text-api
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add:
   ```env
   PORT=5000
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the server:
   ```sh
   npm start
   ```
   The server runs on `http://localhost:5000`

## API Endpoints

### 1. Upload and Transcribe Audio
**Endpoint:** `POST /transcribe`
- Upload an audio file (`audio` field in `multipart/form-data`)
- Returns the transcribed text

### 2. Fetch Previous Transcriptions
**Endpoint:** `GET /transcriptions`
- Retrieves all stored transcriptions

### 3. Delete a Single Transcription
**Endpoint:** `DELETE /transcriptions/:id`
- Deletes a transcription by ID

### 4. Delete All Transcriptions
**Endpoint:** `DELETE /transcriptions`
- Deletes all transcriptions from the database

## Deployment
You can deploy this project on any cloud provider that supports Node.js, such as:
- **Render**
- **Vercel**
- **Heroku**

## License
This project is licensed under the MIT License.

