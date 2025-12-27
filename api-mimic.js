#!/usr/bin/env node

// API Response Simulator - Because real APIs are too reliable
// Simulates the chaos of third-party APIs with inconsistent responses

const http = require('http');
const url = require('url');

// Our "documentation" says these endpoints exist... sometimes
const endpoints = {
    '/users': {
        success: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        chaos: [
            () => ({ error: 'Rate limited. Try again in 5... no, 10 minutes' }),
            () => ({ data: null, message: 'Success!' }),
            () => ({ users: 'yes' }),
            () => ({})
        ]
    },
    '/products': {
        success: [{ id: 1, name: 'Widget' }],
        chaos: [
            () => ({ products: [] }),
            () => ({ error: { code: 500, message: 'Internal server oopsie' } }),
            () => 'just a string, because why not',
            () => ({ data: { items: [{ name: 'Mystery Product' }] } })
        ]
    }
};

// The magic 8-ball decides your fate
function getResponse(endpoint) {
    if (!endpoints[endpoint]) {
        return JSON.stringify({ error: 'Endpoint moved to /v2, then /v3, then deprecated' });
    }
    
    // 30% chance of chaos mode - just like real APIs!
    if (Math.random() < 0.3) {
        const chaosFunc = endpoints[endpoint].chaos[
            Math.floor(Math.random() * endpoints[endpoint].chaos.length)
        ];
        return JSON.stringify(chaosFunc());
    }
    
    // 70% chance of getting what you actually wanted
    return JSON.stringify(endpoints[endpoint].success);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Random delay: because waiting builds character
    setTimeout(() => {
        res.setHeader('Content-Type', 'application/json');
        
        // 5% chance of 500 error - surprise!
        if (Math.random() < 0.05) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Something went wrong. Probably your fault.' }));
            return;
        }
        
        // 10% chance of 404 - the endpoint went on vacation
        if (Math.random() < 0.1) {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Not found (anymore)' }));
            return;
        }
        
        res.writeHead(200);
        res.end(getResponse(parsedUrl.pathname));
    }, Math.random() * 2000); // 0-2 second delay
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`API Chaos Simulator running on port ${PORT}`);
    console.log('Try: curl http://localhost:3000/users');
    console.log('(Results may vary. They definitely will.)');
});
