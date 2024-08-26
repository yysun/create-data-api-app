

module.exports = ({ port,  }) => {
  return `//@ts-check
import server from 'apprun-site/server.js';
const port = process.env.PORT || ${port};
const app = server();

// Regular logging middleware for successful requests
// app.use((req, res, next) => {
//   res.on('finish', () => {
//     req.time = new Date(Date.now()).toString();
//     console.log('Success:', req.user, req.path, req.time);
//   });
//   next();
// });

// Error-handling middleware for logging errors
app.use((err, req, res, next) => {
  req.time = new Date(Date.now()).toString();
  console.error('Error occurred:', err.message, req.user, req.path, req.time);
  res.status(500).send('Internal Server Error');
});

app.listen(port, () => console.log(\`Your app is listening on http://localhost:\${port}\`));
`;
}