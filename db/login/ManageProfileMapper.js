const db = require('../db');


/*
CREATE TABLE user_info (
    user_id VARCHAR(255) NOT NULL PRIMARY KEY,  -- 사용자 고유 ID
    email VARCHAR(255) NOT NULL,         -- 사용자 이메일
    password VARCHAR(255) NOT NULL,         -- 사용자 이메일
    birth_date DATE NOT NULL,                   -- 사용자 생년월일
    name VARCHAR(100) NOT NULL,                 -- 이름
    nickname VARCHAR(100) DEFAULT NULL,      -- 닉네임
    profile_image_url VARCHAR(255) DEFAULT NULL,            -- 프로필 이미지 URL
    phone_number VARCHAR(20),                   -- 전화번호
    latitude DECIMAL(10, 8) DEFAULT NULL,                     -- 위도 (null로 초기화)
    longitude DECIMAL(11, 8) DEFAULT NULL,                    -- 경도 (null로 초기화)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- 계정 생성 시각
);
*/

module.exports = {

    updateProfileInfo(user_id, name, nickname, profile_image_url, phone_number) {
        /*
        name: user_info[0].name,
                    nickname: user_info[0].nickname,
                    profile_image_url: user_info[0].profile_image_url,
                    phone_number : user_info[0].phone_number */

        return new Promise((resolve, reject) => {
            let sql = "";
            if (profile_image_url != null) {

                sql = `update user_info 
                set 
                name = '${name}', 
                nickname = '${nickname}' ,
                profile_image_url = '${profile_image_url}',
                phone_number = '${phone_number}'
                
                where user_id = '${user_id}'`;
            }else{
                
                sql = `update user_info 
                set 
                name = '${name}', 
                nickname = '${nickname}' ,
                phone_number = '${phone_number}'
                where user_id = '${user_id}'`;
            }

            db.query(sql, (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return false; // 에러 처리
                }
                resolve(results); // 성공 시 결과 반환
            });
        });
    },

    updateUserLocation(user_id, latitude, longitude) {


        return new Promise((resolve, reject) => {
            const sql =
                `update user_info 

                set latitude = ${latitude}, longitude = ${longitude} 

                where user_id = '${user_id}'`;

            db.query(sql, (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return false; // 에러 처리
                }
                resolve(results); // 성공 시 결과 반환
            });
        });
    }

}