const result = await fetch("http://localhost:5002/v1/completions", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        model: "88f86fb4-ff8d-4806-a606-e711de7fcdfd", // # ID of the chain to use
        prompt: "Where does curry originate from?",
        // ...any other arguments are ignored
    }),
});

const data = await result.json();

console.log(JSON.stringify(data, null, 2));
