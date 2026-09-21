require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;

const REGISTER_URL = process.env.REGISTER_URL || 'http://localhost:5002';
const LOGIN_URL = process.env.LOGIN_URL || 'http://localhost:5003';
const ADMIN_URL = process.env.ADMIN_URL || 'http://34.205.24.66:5004';
const USER_URL = process.env.USER_URL || 'http://13.221.103.146:5005';

const verifyRole = (requiredRole) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ 
          success: false, 
          message: `Forbidden: ${decoded.role.toUpperCase()} tokens cannot access ${requiredRole.toUpperCase()} endpoints` 
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };
};

app.use('/register', proxy(REGISTER_URL));
app.use('/auth', proxy(LOGIN_URL));

app.use('/admin', verifyRole('admin'), proxy(ADMIN_URL, {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
    proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
    return proxyReqOpts;
  }
}));

app.use('/user', verifyRole('user'), proxy(USER_URL, {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
    proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
    return proxyReqOpts;
  }
}));

app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
