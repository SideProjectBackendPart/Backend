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
    insertUserInfo(data) {
        console.log(data);

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO user_info 
                (user_id, email, password, birth_date, 
                name, nickname, profile_image_url, phone_number) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                data.user_id,
                data.email,
                data.password,
                data.birth_date, // 'YYYY-MM-DD' 형식이어야 함
                data.user_name,
                data.nickname,
                data.profile_image_url,
                data.phone_number
            ];

            console.log("SQL Query:", sql, "Values:", values);

            db.query(sql, values, (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return false; // 에러 처리
                }
                resolve(results); // 성공 시 결과 반환
            });
        });
    }
    ,


    checkPassword(email) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT password, user_id, name FROM user_info where email = '${email}';`, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results); // 쿼리 결과를 resolve로 전달
                });
        });
    },

    checkMember(email) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT count(*) as count FROM user_info where email = '${email}';`, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results); // 쿼리 결과를 resolve로 전달
                });
        });
    },

    selectUserInfo(user_Id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM user_info where user_id = '${user_Id}';`, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results); // 쿼리 결과를 resolve로 전달
                });
        });
    },
    
    updateUserLocation(user_id, latitude, longitude) {


        return new Promise((resolve, reject) => {
            const sql = `update user_info 
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