const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Webhook endpoint for generating invitation codes
app.post('/webhook', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  const code = Math.random().toString(36).substring(2, 15); // Generate a random code

  const { data, error } = await supabase
    .from('invitation_codes')
    .insert([{ code, generated_by: userId }]);

  if (error) {
    console.error('Error generating invitation code', error);
    return res.status(500).send('Error generating invitation code');
  }

  return res.status(200).json({ code });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
