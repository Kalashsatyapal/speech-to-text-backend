require('dotenv').config(); // Load environment variables at the top

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Debug: Ensure API keys are loaded
if (!ASSEMBLYAI_API_KEY) {
    console.error("⚠️ Error: ASSEMBLYAI_API_KEY is missing! Check your .env file.");
    process.exit(1);
} else {
    console.log("✅ ASSEMBLYAI_API_KEY loaded successfully.");
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("⚠️ Error: Supabase credentials are missing! Check your .env file.");
    process.exit(1);
} else {
    console.log("✅ Supabase credentials loaded successfully.");
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Setup Multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    })
});

// AssemblyAI API Route for Transcription
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const audioPath = req.file.path;
        console.log(`📂 Received audio file: ${audioPath}`);

        // Upload file to AssemblyAI
        const fileBuffer = await fs.readFile(audioPath);
        const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', fileBuffer, {
            headers: {
                'Authorization': ASSEMBLYAI_API_KEY,
                'Content-Type': 'application/octet-stream'
            }
        });

        const audioUrl = uploadResponse.data.upload_url;
        console.log(`🔼 File uploaded to AssemblyAI: ${audioUrl}`);

        // Request transcription
        const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
            audio_url: audioUrl
        }, {
            headers: { 'Authorization': ASSEMBLYAI_API_KEY }
        });

        const transcriptId = transcriptResponse.data.id;
        console.log(`📜 Transcription started with ID: ${transcriptId}`);

        // Poll for transcription result
        let transcriptResult;
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const pollingResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: { 'Authorization': ASSEMBLYAI_API_KEY }
            });

            if (pollingResponse.data.status === 'completed') {
                transcriptResult = pollingResponse.data.text;
                break;
            } else if (pollingResponse.data.status === 'failed') {
                throw new Error('Transcription failed');
            }
        }

        console.log('✅ Transcription completed:', transcriptResult);

        // Save transcription to Supabase
        const { error } = await supabase
            .from('transcriptions')
            .insert([{ transcription: transcriptResult, created_at: new Date() }]);

        if (error) {
            throw new Error(`Supabase Insert Error: ${error.message}`);
        }

        console.log('📥 Transcription saved to Supabase.');

        // Delete file after processing
        await fs.unlink(audioPath);

        res.json({ transcription: transcriptResult });

    } catch (error) {
        console.error('❌ Error transcribing audio:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || 'Failed to transcribe audio' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
