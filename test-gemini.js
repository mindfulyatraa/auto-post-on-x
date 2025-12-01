// Direct test of Gemini API
const testGemini = async () => {
    const apiKey = 'AIzaSyBilT1xbamME8zBS2ztJGidOA2Ghy5ON6I';

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: 'Say hello in one word' }]
                }],
            })
        });

        const data = await response.json();
        console.log('✅ Gemini API Response:', JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates[0]) {
            console.log('✅ Text:', data.candidates[0].content.parts[0].text);
        } else {
            console.log('❌ Error:', data);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
};

testGemini();
