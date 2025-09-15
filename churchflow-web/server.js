const express = require('express');
const serve = require('serve-static');
const path = require('path');

const app = express();
const pub = path.join(__dirname, 'public');

app.use(serve(pub, { index: ['index.html'] }));

// fallback for direct links to nested pages
app.use((req, res) => res.sendFile(path.join(pub, 'index.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`UI running at http://localhost:${port}`));
