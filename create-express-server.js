module.exports = ({ port, public }) => {

  return `const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json());
${public && `app.use(express.static('${public}'));` || ''}

require('./app-express')(app);

const port = process.env.port || ${port || 3000};
app.listen(port, () => {
  console.log(\`API server listening on port \${port}\`);
});
`;

}