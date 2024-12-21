const LoginMapper = require('../db/login/LoginMapper');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // uuid의 v4를 직접 가져와 사용
module.exports = { login, register }

const uuid = () => {
    const tokens = uuidv4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
}

async function login(req, res) {

    console.log(req.body.email);
    console.log(req.body.password);

    let result = await LoginMapper.checkMember(req.body.email);
    console.log("result", result[0])
    if (result[0].password == req.body.password) {
        // 로그인 성공 예제 데이터를 작성
        const response = {
            success: true,
            message: "Login successful",   // 로그인 성공 메시지
            token: "your-jwt-token",       // 인증에 사용할 JWT 토큰
            user: {
                id: result[0].user_id,             // 사용자 ID
                name: result[0].name,         // 사용자 이름
                email: result[0].email       // 사용자 이메일
            }
        };

        // 클라이언트에 JSON 응답 전송
        res.json(response);
    } else {
        res.json({
            success: false,
            message: "Invalid credentials",

        });
    }
}

async function register(req, res) {
    console.log(req.body.email);
    console.log(req.body.password);
    console.log("LoginMapper.checkMember(req.body.email).password :", await LoginMapper.checkMember(req.body.email));

    const existingUser = await LoginMapper.checkMember(req.body.email);

    // 이메일이 이미 사용 중인 경우
    if (existingUser && existingUser[0]?.password) {
        const response = {
            success: false,
            message: "Validation error",
            errors: {
                password: "이미 사용중인 이메일 입니다.", // 비밀번호 불일치
            }
        };

        res.json(response);
        return; // 함수 실행 종료
    }

    let userId = uuid();

    let data = {
        user_id: userId,
        email: req.body.email,
        password: req.body.password,
        birth_date: req.body.birth_date,
        
        user_name: req.body.profile.name,
        nickname: req.body.profile.nickname,
        profile_image_url: req.body.profile.profile_image_url,
        phone_number: req.body.profile.phone_number
    };
    console.log("입력 받은 데이터 :\n", data);

    let checkUserInfo = await LoginMapper.insertUserInfo(data);

    console.log("checkUserInfo :", checkUserInfo);

    if (checkUserInfo) {
        let selectData = await LoginMapper.selectUserInfo(userId);

        const response = {
            success: true,
            message: "Registration successful",
            data: {
                user_id: userId,
                email: req.body.email,
                birth_date: req.body.birth_date,
                profile: {
                    name: req.body.profile.name,
                    nickname: req.body.profile.nickname,
                    profile_image_url: selectData.profile_image_url,
                    phone_number: selectData.phone_number
                },
                location: {
                    latitude: selectData.latitude,
                    longitude: selectData.longitude
                },
                created_at: selectData.created_at
            }
        };

        res.json(response);
        return; // 함수 실행 종료
    } else {
        res.json({
            success: false,
            message: "저장 실패"
        });
        return; // 함수 실행 종료
    }
}
