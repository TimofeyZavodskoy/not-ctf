import Fastify from "fastify";
import "dotenv/config";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyStatic from '@fastify/static';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
    logger: true
});

const XOR_KEY = process.env.XOR_KEY;
const HOST = process.env.SERVER_HOST;
const PORT = process.env.SERVER_PORT;
const flag = "flag{X0R_1s_n0t_r34l_cr1pt0_09a1f}";

//КТО ОСТАВИЛ http://127.0.0.1:5500/robots.txt ДОСТУПНЫМ ?!для особо одаряенных: robot.txt не должен висеть в коде, убрать немедленно!!!
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/', 
});

app.get("/", async (request, reply) => {
    return reply.send("Site is under construction. Check the disk link: [ТВОЯ_ССЫЛКА]");
});

function xorEncode(text, key) {
    return text.split("").map((char, i) => {
        return (char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
            .toString(16)
            .padStart(2, "0");
    }).join("");
}

app.get("/api/v1/internal/data", async (request, reply) => {
    const id = request.headers["x-xor-auth"];

    if (!id) {
        return reply.status(400).send({
            error: "Не тот формат или заголовок авторизации отсутствует",
            hint: "Проверьте robots.txt"
        });
    }

    if (id == "1963_Fargiev") {
        return {
            status: "success :(",
            data_type: "confidential_archive_record",
            payload: xorEncode(flag, XOR_KEY),
            message: "Oops! We use XOR encoding for connection safety. Use your access key to read the data.",
            audit_log: "Access granted for TimofeyZavodskoy audit session"
        }
    }

    return reply.status(404).send({
        error: "Not Found",
        requested_auth: id,
        hint: "Verify biographical data on the main site."
    });
});

app.post('/api/v1/internal/logs', async (request, reply) => {
    return reply.status(202).send({ status: "Accepted" });
});

app.get('/health', async () => {
    return { 
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        db_connection: "connected"
    };
});

const start = async () => {
    try {
        await app.listen({port: PORT, host: HOST});
    } catch (err) {
        app.log.error(err);
        process.exit(1)
    }
};

start();