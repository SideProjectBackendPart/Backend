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

    checkMember(email) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM user_info where email = '${email}';`, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results); // 쿼리 결과를 resolve로 전달
                });
        });
    },

    selectUserInfo(user_Id){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM user_info where user_id = '${user_Id}';`, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results); // 쿼리 결과를 resolve로 전달
                });
        });
    }
}

function selectAll(page, n) {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT item_id, item_title, item_date FROM shop_board limit ${(page - 1) * n} , ${n};`, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results); // 쿼리 결과를 resolve로 전달
            });
    });
}

function countAllItems() {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT COUNT(*) AS total FROM shop_board`, // 'AS total'로 별칭 지정
            (err, results) => {
                if (err) {
                    return reject(err); // 오류 발생 시 reject
                }

                console.log(results)
                resolve(results[0].total); // 결과의 첫 번째 항목에서 total 값을 반환
            }
        );
    });
}


function selectThumnailAll(page, n) {

    return new Promise((resolve, reject) => {
        db.query(
            `SELECT 
                    s.item_id, s.item_title, s.item_price, i.image_url 
                FROM 
                    shop_board as s
                LEFT JOIN 
                    image_info AS i
                ON 
                    s.item_image_link = i.image_uuid
                where 
                    s.item_image_link is not null                
                limit ${(page - 1) * n} , ${n};
                `, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results); // 쿼리 결과를 resolve로 전달
        });
    });
}
function showItem(item_id) {
    return new Promise((resolve, reject) => {

        let sql = `
                SELECT 
                    s.item_id,
                    s.item_title, 
                    s.item_content, 
                    s.item_date, 
                    s.item_price, 
                    i.image_url,
                    i.image_hash_code
                FROM 
                    shop_board AS s
                LEFT JOIN 
                    image_info AS i
                ON 
                    s.item_image_link = i.image_uuid
                WHERE 
                    s.item_id = ${item_id};
                `

        db.query(sql, (err, results) => {

            if (err) {
                return reject(err);
            }
            resolve(results); // 쿼리 결과를 resolve로 전달
        });
    });
}

function insertItem(data) {

    console.log(data);

    return new Promise((resolve, reject) => {
        let sql = `INSERT INTO shop_board (item_title, item_content, item_price, item_image_link) 
                VALUES ('${data.title}', '${data.content}', ${data.price}, '${data.image}')`

        if (data.image == null) {
            sql = `INSERT INTO shop_board (item_title, item_content, item_price) 
                VALUES ('${data.title}', '${data.content}', ${data.price})`
        }

        db.query(
            sql, (err, results) => {
                if (err) {
                    return reject(err);
                }

                resolve(results.insertId); // insert 후 자동으로 생성된 item_id 값 반환
            });
    });
}

function insertImageInfo(data) {
    return new Promise((resolve, reject) => {
        let sql =
            `INSERT INTO 
                image_info (image_uuid, image_original_name, image_url, image_hash_code, image_color_group) 
                VALUES 
                ('${data.imageUuid}', '${data.imageOriginalName}', '${data.imageUrl}', '${data.imageHashCode}', ${data.imageColorGroup})`

        db.query(
            sql, (err, results) => {
                if (err) {
                    return reject(err);
                }

                resolve(results.insertId); // insert 후 자동으로 생성된 item_id 값 반환
            });
    });
}

function insertColorTag(uuid, tag) {
    return new Promise((resolve, reject) => {
        let sql =
            `INSERT IGNORE INTO 
                image_color_tag (image_color_uuid, color_tag) 
                VALUES 
                ('${uuid}', '${tag}')`

        db.query(
            sql, (err, results) => {
                if (err) {
                    return reject(err);
                }

                resolve(results); // insert 후 자동으로 생성된 item_id 값 반환
            });
    });
}

function deleteItem(item_id) {
    return new Promise((resolve, reject) => {
        let sql =
            `'DELETE s, i, c
                    FROM shop_board AS s
                LEFT JOIN image_info AS i 
                    ON s.item_image_link = i.image_uuid
                LEFT JOIN image_color_tag AS c 
                    ON s.item_image_link = c.image_color_uuid
                WHERE 
                    s.item_id = ${item_id};'`;
        db.query(
            sql, (err, results) => {
                if (err) {
                    return reject(err);
                }

                resolve(results); // insert 후 자동으로 생성된 item_id 값 반환
            });
    });

}

function selectHashValue() {

    return new Promise((resolve, reject) => {
        db.query(


            `SELECT 
                    s.item_id, s.item_title, s.item_price, i.image_url ,i.image_hash_code
                FROM 
                    shop_board as s
                LEFT JOIN 
                    image_info AS i
                ON 
                    s.item_image_link = i.image_uuid
                where 
                    s.item_image_link is not null
                `, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results); // 쿼리 결과를 resolve로 전달
        });
    });
}

function selectHashValueV1() {

    return new Promise((resolve, reject) => {
        db.query(


            `SELECT 
                    s.item_id, s.item_title, s.item_price, i.image_url, i.image_phash_v1 as image_hash_code
                FROM 
                    shop_board as s
                LEFT JOIN 
                    image_info AS i
                ON 
                    s.item_image_link = i.image_uuid
                where 
                    s.item_image_link is not null
                `, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results); // 쿼리 결과를 resolve로 전달
        });
    });
}

function updatePhash(hash, url) {
    return new Promise((resolve, reject) => {
        let sql =
            //`update image_info set image_hash_code = '${hash}'
            `update image_info set image_phash_v1 = '${hash}'
                where image_uuid = '${url}'`


        db.query(
            sql, (err, results) => {
                if (err) {
                    return reject(err);
                }

                resolve(results); // insert 후 자동으로 생성된 item_id 값 반환
            });
    });
}
