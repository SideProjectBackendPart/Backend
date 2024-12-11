const bcrypt = require('bcrypt');


// MySQL 연결 설정
module.exports = async (fastify) => {
  const db = fastify.mysql;

  // 회원가입 API
  fastify.post('/register', async (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.status(400).send({ message: '모든 필드를 입력해주세요.' });
    }

    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        return reply.status(400).send({ message: '이미 사용 중인 이메일입니다.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [
        username,
        email,
        hashedPassword,
      ]);

      reply.status(201).send({ message: '회원가입 성공!' });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: '회원가입 중 오류가 발생했습니다.' });
    }
  });

  // 로그인 API
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return reply.status(400).send({ message: '등록되지 않은 이메일입니다.' });
      }

      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return reply.status(400).send({ message: '비밀번호가 일치하지 않습니다.' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      reply.status(200).send({ message: '로그인 성공!', token });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: '로그인 중 오류가 발생했습니다.' });
    }
  });
};
