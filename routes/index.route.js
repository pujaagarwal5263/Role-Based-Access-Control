const router = require('express').Router();

router.get('/', (req, res, next) => {
  //res.send("hello world")
  res.render('index');
});

module.exports = router;