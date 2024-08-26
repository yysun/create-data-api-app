import jwt from 'jsonwebtoken';

// TODO: implement authentication
export default (req, res, next) => {
  const accessToken = req.headers['authorization'];
  if (!accessToken) {
    return res.status(401).send('Access Denied. No token provided.');
  }
  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}