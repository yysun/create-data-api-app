module.exports = ({ name, port, public, authentication }) => {

  return `require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());
// Regular logging middleware for successful requests
app.use((req, res, next) => {
  res.on('finish', () => {
    req.time = new Date(Date.now()).toString();
    console.log('Success:', req.user, req.path, req.time);
  });
  next();
});

// Error-handling middleware for logging errors
app.use((err, req, res, next) => {
  req.time = new Date(Date.now()).toString();
  console.error('Error occurred:', err.message, req.user, req.path, req.time);
  res.status(500).send('Internal Server Error');
});
${public && `app.use(express.static('${public}'));` || ''}

${authentication === 'jwtAuth' ? `const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const refreshTokens = []; // In a real app, use a database

app.authenticate = (req, res, next) => {
  const accessToken = req.headers['authorization'];
  if (!accessToken) {
    return res.status(401).send('Access Denied. No token provided.');
  }
  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const createToken = (user, res) => {
  const accessToken = jwt.sign({ user }, accessTokenSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ user }, refreshTokenSecret, { expiresIn: '1d' });
  refreshTokens.push(refreshToken); // storeRefreshToken(refreshToken);
  res.cookie('refresh-token', refreshToken, { httpOnly: true, secure: true })
    .send(accessToken);
}
app.post('/auth/register', async (req, res) => {
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = {}; // await verify( username, password });
  if (!user) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  createToken(user, res);
});

app.post('/auth/refresh', (req, res) => {
  const refreshToken = req.cookies['refresh-token'];
  if (!refreshToken || !refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }
  jwt.verify(refreshToken, refreshTokenSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    refreshTokens = refreshTokens.filter(t => t !== refreshToken); //removeRefreshToken(refreshToken);
    createToken(user, res);
  });
});

app.post('/auth/logout', (req, res) => {
  const refreshToken = req.cookies['refresh-token'];
  refreshTokens = refreshTokens.filter(t => t !== refreshToken); //removeRefreshToken(refreshToken);
  res.sendStatus(204);
});
`: `
${authentication ? `\/\/ TODO: implement ${authentication}
app.authentication = (_, __, next) => next();
`: ''}`}
require('./app-express')(app);

const port = process.env.port || ${port || 3000};
app.listen(port, () => {
  console.log(\`${name} is listening on port \${port}\`);
});
`;

}