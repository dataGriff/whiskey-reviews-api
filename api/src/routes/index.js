const router = require('express').Router();

router.use(require('./auth'));
router.use('/reviews', require('./reviews'));

module.exports = router;
