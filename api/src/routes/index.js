const router = require('express').Router();

router.use(require('./auth'));
router.use('/whiskies', require('./whiskies'));
router.use('/reviews', require('./reviews'));

module.exports = router;
