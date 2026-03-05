async function test() {
    try {
        const res = await fetch("http://localhost:3001/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Cookie": "next-auth.session-token=mock" },
            body: JSON.stringify({
                messages: [{ role: "user", content: "hello" }],
                propertyId: "demo-property",
                startDate: "2024-01-01",
                endDate: "2024-01-31"
            })
        });
        
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text);
    } catch(e) {
        console.error(e);
    }
}
test();
