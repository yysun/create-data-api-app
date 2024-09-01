

module.exports = ({ port, databases}) => {
  return `//@ts-check
//* use the server from apprun-site, no need to load routers
import server from 'apprun-site/server.js';
const app = server();

//* build your own server with express
// import express from 'express';
// import bodyParser from 'body-parser';
// const app = express();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

${databases.map(db => `// import ${db.name} from './api/${db.name}.js';`).join('\n')}
${databases.map(db => `// app.use(${db.name});`).join('\n')}

// app.use((req, res, next) => {
//   res.on('finish', () => {
//     const time = new Date(Date.now()).toString();
//     console.log('Success:', req.path, time);
//   });
//   next();
// });

// app.use((err, req, res, next) => {
//   const time = new Date(Date.now()).toString();
//   console.error('Error occurred:', req.path, time, err.message);
//   res.status(500).send(err.message);
// });

const port = process.env.PORT || ${port};
app.listen(port, () => console.log(\`Your app is listening on http://localhost:\${port}\`));
`;
}