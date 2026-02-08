//middleware/authorize.js

const authorize = (roles = []) => {
  return (req, res, next) => {
    console.log('Authorize middleware - req.user:', req.user);
    console.log('Authorize middleware - roles:', roles);
    console.log('Authorize middleware - user role:', req.user?.role);

    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      console.log('Access denied - user not authorized');
      return res.status(403).json({ message: "Access denied" });
    }
    console.log('Access granted');
    next();
  };
};

export default authorize;
