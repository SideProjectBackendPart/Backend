const fastify = require('fastify')({ logger: true });
const mysql = require('mysql2/promise');
const path = require('path');
// MySQL 설정
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password', // 실제 비밀번호 입력
  database: 'userdb',
});


// MySQL 플러그인 등록
fastify.decorate('mysql', db);


fastify.register(require('fastify-autoload'), {
  dir: path.join(__dirname, 'routes'),
});

// 라우트 등록
const start = async () => {
  try {

    await fastify.listen({ port: 3000 });
    fastify.log.info('server start http://localhost:3000');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
