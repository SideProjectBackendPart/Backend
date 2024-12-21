const db = require('../db');


/*
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY, -- 메시지 고유 ID
    user_id VARCHAR(255) NOT NULL,             -- 메시지를 작성한 사용자 ID
    title VARCHAR(255) NOT NULL,               -- 메시지 제목
    content TEXT NOT NULL,                     -- 메시지 내용
    anonymous BOOLEAN NOT NULL DEFAULT TRUE,   -- 익명 여부 (true: 익명, false: 공개)
    recruit_count INT NOT NULL CHECK (recruit_count >= 1), -- 모집 인원 (1 이상의 정수)
    latitude DECIMAL(10, 8) DEFAULT NULL,      -- 선택된 위치 정보 - 위도
    longitude DECIMAL(11, 8) DEFAULT NULL,     -- 선택된 위치 정보 - 경도
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- 메시지 생성 시각
);

CREATE TABLE msg_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY, -- 카테고리 고유 ID
    message_id VARCHAR(255) NOT NULL,
    category_name VARCHAR(255) NOT NULL           -- 카테고리 이름 (예: "#게임", "#스터디")
);
*/

module.exports = {
    insertMsg(data) {
        console.log(data);

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO messages 
                (user_id, title, content, anonymous, 
                recruit_count, latitude, longitude) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

            const values = [
                data.user_id,
                data.title,
                data.content,
                data.anonymous, // 'YYYY-MM-DD' 형식이어야 함
                data.recruit_count,
                data.latitude,
                data.longitude,
            ];


            db.query(sql, values, (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return false; // 에러 처리
                }
                resolve(results.insertId); // 성공 시 결과 반환
            });
        });
    }
    ,
    insertCategoryInfo(data) {
        console.log(data);

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO msg_categories 
                (message_id, category_name)
                VALUES (?, ?)`;

            const values = [
                data.message_id,
                data.category_name
            ];


            db.query(sql, values, (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return false; // 에러 처리
                }
                resolve(results); // 성공 시 결과 반환
            });
        });
    },

    getMessageById(messageId) {
        const sql = `
            SELECT 
                m.message_id,
                m.user_id,
                m.title,
                m.content,
                m.anonymous,
                m.recruit_count,
                JSON_ARRAYAGG(mc.category_name) AS categories,
                JSON_OBJECT(
                    'latitude', m.latitude,
                    'longitude', m.longitude
                ) AS location,
                m.created_at
            FROM 
                messages m
            LEFT JOIN 
                msg_categories mc ON m.message_id = mc.message_id
            WHERE 
                m.message_id = ${messageId}
            GROUP BY 
                m.message_id;
        `;

        return new Promise((resolve, reject) => {
            db.query(sql, [messageId], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0]); // 단일 메시지만 반환
            });
        });
    }
}