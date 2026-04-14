const express = require('express');
const cors = require('cors');
const regexRoutes = require('./routes/regexRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api', regexRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Regex Language Explorer API listening on http://localhost:${PORT}`);
});
