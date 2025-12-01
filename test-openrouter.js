// Test OpenRouter API directly
const testOpenRouter = async () => {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: 'Say hello'
                    }
                ]
            })
        });

        const data = await response.json();
        console.log('OpenRouter Response:', data);

        if (response.ok) {
            console.log('✅ OpenRouter API is working!');
            console.log('Response:', data.choices[0].message.content);
        } else {
            console.error('❌ OpenRouter API Error:', data);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
};

testOpenRouter();
