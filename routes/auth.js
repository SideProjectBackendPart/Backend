const router = require('express').Router();
const loginController = require('../controller/loginController');
const manageProfileController = require('../controller/manageProfileController');
const multer = require('multer');
const multer_s3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();


const uuid = () => {
    const tokens = uuidv4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
}

const s3Client = new S3Client({
    region: process.env.aws_s3_region,
    credentials: {
        accessKeyId: process.env.aws_s3_accessKey,
        secretAccessKey: process.env.aws_s3_secretKey
    }
});

const storage = multer_s3({
    s3: s3Client,
    bucket: process.env.aws_s3_bucket,
    contentType: multer_s3.AUTO_CONTENT_TYPE,

    key: function (req, file, cb) {

        cb(null, `profile/${uuid()}`); // UUID 사용
    }
});

const upload = multer({
    storage: storage // storage를 multer_s3 객체로 지정
});



router.post('/login', loginController.login);
router.post('/register', loginController.register);

router.post('/emailAuth', loginController.sendAuthEmail);
router.post('/phoneAuth', loginController.sendAuthphoneNumber);
router.post('/checkAuthCode', loginController.checkAuthCode);

router.post('/updateLocation', manageProfileController.updateUserLocation)

router.post('/getProfileInfo', manageProfileController.getProfileInfo)
router.post('/updateProfileInfo', upload.single('item_image_link'), manageProfileController.updateProfileInfo)


module.exports = router;
