const msgMapper = require('../db/massages/msgMapper');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid'); // uuid의 v4를 직접 가져와 사용
module.exports = { sendMessgae }

const uuid = () => {
    const tokens = uuidv4().split('-')
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
}
async function sendMessgae(req, res) {
    console.log(req.body);


    let data = {

        user_id: req.body.user_id,
        title: req.body.title,
        content: req.body.content,
        anonymous: req.body.anonymous,
        recruit_count: req.body.recruit_count,
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude
    };


    console.log("입력 받은 데이터 :\n", data);

    let msgId = await msgMapper.insertMsg(data)

    console.log("msgId :", msgId);

    if (msgId) {

        for (const categoryName of req.body.categories) {
            let category = {
                message_id: msgId,
                category_name: categoryName
            }
            await msgMapper.insertCategoryInfo(category)
        }
    } else {
        res.json({
            success: false,
            message: "저장 실패"
        });
        return; // 함수 실행 종료
    }

    const message = await msgMapper.getMessageById(msgId);

    if (!message) {
        return res.status(404).json({
            success: false,
            message: "Message not found"
        });
    }

    const response = {
        success: true,
        message: "Message created successfully",
        data: {
            message_id: message.message_id,
            user_id: message.user_id,
            title: message.title,
            content: message.content,
            anonymous: message.anonymous,
            recruit_count: message.recruit_count,
            categories: JSON.parse(message.categories), // JSON 배열로 변환
            location: JSON.parse(message.location),     // JSON 객체로 변환
            created_at: message.created_at
        }
    };

    console.log("response : ", response)

    res.json(response);

}
