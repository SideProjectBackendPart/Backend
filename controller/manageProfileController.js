const LoginMapper = require('../db/login/LoginMapper');
const mngMapper = require('../db/login/ManageProfileMapper');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // uuid의 v4를 직접 가져와 사용

module.exports = { getProfileInfo, updateUserLocation, updateProfileInfo }

//사용자 위치 정보 저장
async function getProfileInfo(req, res) {

    console.log(`userId : ${req.body.user_id}`);

    try {
        if (req.body.user_id != null) {
            const user_info = await LoginMapper.selectUserInfo(req.body.user_id);

            res.json({
                success: true,
                message: '프로필 정보 불러오기 성공.',

                name: user_info[0].name,
                nickname: user_info[0].nickname,
                profile_image_url: user_info[0].profile_image_url,
                phone_number: user_info[0].phone_number
            });
        } else {
            res.json({
                success: false,

                message: '프로필 정보 불러오기 실패'
            });
        }



    } catch {
        res.json({
            success: false,

            message: '프로필 정보 불러오기 실패'
        });
    }

}
async function updateProfileInfo(req, res) {
    try {
        console.log(`userId : ${req.body.user_id}`);

        if (req.body.user_id != null) {
            let imageUrl = null;

            // Base64 이미지 처리
            if (req.body.profile_image) {
                const base64Image = req.body.profile_image;
                const imageBuffer = Buffer.from(base64Image, 'base64'); // Base64 -> Buffer 변환
                const imageUuid = `profile/${uuidv4()}.png`; // 이미지 UUID 생성

                // S3 업로드
                await s3Client.send(
                    new PutObjectCommand({
                        Bucket: process.env.aws_s3_bucket,
                        Key: imageUuid,
                        Body: imageBuffer,
                        ContentType: 'image/png', // 이미지 형식 지정
                    })
                );

                imageUrl = `${process.env.cloudfront}${imageUuid}`; // CloudFront URL 생성
                console.log(`이미지 업로드 완료: ${imageUrl}`);
            } else if (req.file) {
                // Multer-S3로 업로드된 이미지 처리
                const imageUuid = req.file.key;
                imageUrl = `${process.env.cloudfront}${imageUuid}`;
                console.log(`Multer 이미지 업로드 완료: ${imageUrl}`);
            }

            // 프로필 정보 업데이트
            const updateUserInfo = await mngMapper.updateProfileInfo(
                req.body.user_id,
                req.body.name,
                req.body.nickname,
                imageUrl, // 이미지 URL 전달
                req.body.phone_number
            );

            console.log(updateUserInfo);

            // 업데이트된 사용자 정보 가져오기
            const userInfo = await LoginMapper.selectUserInfo(req.body.user_id);

            res.json({
                success: true,
                message: '프로필 정보 불러오기 성공.',
                name: userInfo[0].name,
                nickname: userInfo[0].nickname,
                profile_image_url: userInfo[0].profile_image_url,
                phone_number: userInfo[0].phone_number,
            });
        } else {
            res.json({
                success: false,
                message: '프로필 정보 불러오기 실패.',
            });
        }
    } catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: '프로필 정보 저장 실패.',
        });
    }
}



//사용자 위치 정보 저장
async function updateUserLocation(req, res) {


    console.log(`userId : ${req.body.user_id} , 위도 : ${req.body.latitude}, 경도 : ${req.body.longitude}`);

    try {
        if (req.body.user_id != null && req.body.user_id != null && req.body.user_id != null) {
            const isSuccess = await mngMapper.updateUserLocation(req.body.user_id, req.body.latitude, req.body.longitude);

            res.json({
                success: true,

                message: '위치 정보 저장 성공.'
            });
        } else {
            res.json({
                success: false,

                message: '위치 정보에 빈칸이 있음'
            });
        }

    } catch {
        res.json({
            success: false,

            message: '위치정보 저장 실패.'
        });
    }

}