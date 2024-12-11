module.exports = async (fastify) => {
    fastify.get('/example', async (request, reply) => {
        return { message: 'This is an example route!' };
    });
};
