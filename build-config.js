const fs = require('fs');
const config = `window.APP_CONFIG = {
  supabaseUrl: '${process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE'}',
  supabaseAnonKey: '${process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'}',
  groqApiKey: '${process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE'}',
  groqModel: 'llama-3.3-70b-versatile'
};`;
if (!fs.existsSync('js')) fs.mkdirSync('js');
fs.writeFileSync('js/config.js', config);
console.log('✅ js/config.js generated from environment variables');
