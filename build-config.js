const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const groqApiKey = process.env.GROQ_API_KEY || '';

const config = `window.APP_CONFIG = {
  supabaseUrl: '${supabaseUrl}',
  supabaseAnonKey: '${supabaseAnonKey}',
  groqApiKey: '${groqApiKey}',
  groqModel: 'llama-3.3-70b-versatile'
};`;

if (!fs.existsSync('js')) fs.mkdirSync('js');
fs.writeFileSync('js/config.js', config);

console.log('✅ js/config.js generated from environment variables');
if (!supabaseUrl) console.warn('⚠️  SUPABASE_URL env var is not set');
if (!supabaseAnonKey) console.warn('⚠️  SUPABASE_ANON_KEY env var is not set');
if (!groqApiKey) console.warn('⚠️  GROQ_API_KEY env var is not set');
