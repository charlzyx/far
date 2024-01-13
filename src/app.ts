import { IncomingMessage, Server, ServerResponse } from "http";
import { MinLength, ReflectionClass, cast, typeOf } from "@deepkit/type";
import Fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";

const fastify: FastifyInstance = Fastify({
	logger: true,
});

/**
 * Run the server!
 */
const start = async () => {
	try {
		await fastify.listen({ port: 3000 });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
