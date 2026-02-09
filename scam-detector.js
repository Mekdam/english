const GEMINI_API_KEY = "AIzaSyC1FO7Rc7xmM-hoyeMqpXF8fRnB_WG7Efk";

async function analyzeWithGemini() {
    const input = document.getElementById('scamInput');
    const btn = document.getElementById('analyzeBtn');
    const resultDiv = document.getElementById('riskResult');
    const riskTitle = document.getElementById('riskTitle');
    const riskMessage = document.getElementById('riskMessage');
    const detectedList = document.getElementById('detectedList');

    if (!input.value.trim()) {
        alert('Please paste some text to analyze.');
        return;
    }

    btn.disabled = true;
    btn.textContent = "Gemini is analyzing...";
    resultDiv.classList.remove('show'); 

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Analyze this text for scams. Return ONLY a JSON object with 'level' (Low|Medium|High), 'class' (risk-low|risk-medium|risk-high), and 'flags' (list of suspicious reasons). Text: " },
                        { text: input.value }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        let rawJson = data.candidates[0].content.parts[0].text;
        // Clean up markdown code blocks if the AI includes them
        rawJson = rawJson.replace(/```json|```/g, '').trim();
        const ai = JSON.parse(rawJson);

        // Populate and Show Result
        resultDiv.className = `risk-result show ${ai.class}`;
        riskTitle.textContent = `Risk Level: ${ai.level}`;
        riskMessage.textContent = `Gemini detected ${ai.flags.length} potential red flags.`;
        detectedList.innerHTML = ai.flags.map(f => `<p>• ${f}</p>`).join('');

    } catch (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.textContent = "Analyze with Gemini";
    }
}

function clearDetector() {
    document.getElementById('scamInput').value = "";
    document.getElementById('riskResult').classList.remove('show');
}