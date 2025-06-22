export const requireAuth = (req, res, next) => {
  // const authHeader = req.headers.authorization;

  // console.log("Received Auth Header:", authHeader);
  // console.log("Expected:", `Bearer ${process.env.ADMIN_TOKEN}`);


  // if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
  //   return res.status(401).json({ success: false, message: 'Unauthorized' });
  // }

  next();
};
