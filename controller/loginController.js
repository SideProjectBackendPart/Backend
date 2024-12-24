const LoginMapper = require('../db/login/LoginMapper');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // uuid의 v4를 직접 가져와 사용
const nodemailer = require('nodemailer')

module.exports = { login, register, sendAuthEmail }

const uuid = () => {
    const tokens = uuidv4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
}

async function login(req, res) {

    console.log(req.body.email);
    console.log(req.body.password);

    try {
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
    } catch {
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


async function sendAuthEmail(req, res) {
    try {
        console.log(req.body.email);

        const checkAuth = Math.floor(100000 + Math.random() * 900000);
        console.log("checkAuth : ", checkAuth);

        const { email_service, authEmail, authEmailPassword } = process.env;

        const transporter = nodemailer.createTransport({
            service: email_service,
            auth: {
                user: authEmail,
                pass: authEmailPassword
            }
        });

        const mailOptions = {
            from: authEmail,
            to: `${req.body.email}`,
            subject: 'sideProject에서 이메일 인증 요청이 도착했습니다.',
            html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }
            table {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-collapse: collapse;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                background-color: #4caf50;
                color: #ffffff;
                text-align: center;
                padding: 20px;
                font-size: 24px;
                font-weight: bold;
            }
            .content {
                padding: 20px;
                text-align: center;
                font-size: 16px;
                color: #333333;
            }
            .code {
                display: inline-block;
                background-color: #f1f1f1;
                padding: 10px 20px;
                border-radius: 5px;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
                color: #4caf50;
                margin: 20px 0;
            }
            .footer {
                background-color: #f1f1f1;
                text-align: center;
                padding: 10px;
                font-size: 14px;
                color: #666666;
            }
            .footer a {
                color: #4caf50;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <table>
            <tr>
                <td class="header">
                    Verification Code
                </td>
            </tr>
            <tr>
                <td class="content">
                    <p>우리의 서비스를 이용해주셔서 감사합니다.</p>
                    <p>아래의 6자리 인증 번호를 입력해주십시오:</p>
                    <br>
                    <div class="code">${checkAuth}</div>
                    <br>
                    <p>계정을 확인하려면 10분 이내에 이 코드를 입력하십시오.</p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>만약 인증을 요청한 적이 없다면, <a href="#">고객센터</a>로 연락하십시오.</p>
                    <p>&copy; 2024 sideProject. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email Sent : ', info);
                res.json({
                    success: true,
                    checkAuth: checkAuth
                });
            }
        })
    } catch {
        res.json({
            success: false,
            message: '이메일이 제대로 전송되지 않았습니다.'
        });
    }
}
