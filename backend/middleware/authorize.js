//middleware/authorize.js

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export default authorize;
