module.exports = ({ name, port, public, authentication }) => {

  return `const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());
${public && `app.use(express.static('${public}'));` || ''}

${authentication === 'jwtAuth' ? `const jwt = require('jsonwebtoken');
app.authentication = (req, res, next) => {
  const SECRET_KEY = procees.env.SECRET_KEY;
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).send('Token not provided.');
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send('Failed to authenticate token.');
    }
    req.userId = decoded.userId; // Attach used id to the request object
    req.roles = decoded.roles;  // Attach roles to the request object
    next();
  });
}
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