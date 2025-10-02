require('dotenv').config();
const axios = require('axios');

async function testAzureOpenAI() {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deployment = process.env.AZURE_OPENAI_CHATGPT_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

    console.log('Testing Azure OpenAI Connection...');
    console.log('Endpoint:', endpoint);
    console.log('Deployment:', deployment);
    console.log('API Version:', apiVersion);
    console.log('API Key:', apiKey ? '***' + apiKey.slice(-4) : 'NOT SET');
    console.log('');

    const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    console.log('Full URL:', url);
    console.log('');

    const response = await axios.post(url, {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
      max_tokens: 50,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      }
    });

    console.log('✅ SUCCESS! Azure OpenAI is working correctly.');
    console.log('Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAzureOpenAI();
