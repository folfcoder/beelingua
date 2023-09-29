import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
	DB: D1Database;
    AUTH_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	"/*",
	cors({
		origin: "*",
		allowMethods: ["GET", "PUT"],
	})
);

app.get("/:lang/:course/:unit/:number", async (c) => {
	const { lang, course, unit, number } = c.req.param();
	const ans = await c.env.DB.prepare(
		"SELECT answer FROM answers WHERE language = ? AND course = ? AND unit = ? AND number = ?"
	)
		.bind(lang, course, unit, number)
		.first();
	if (!ans) {
		return c.json([], 404);
	}
	return c.json(JSON.parse(ans.answer as string));
});

app.put("/:lang/:course/:unit/:number", async (c) => {
    // Basic auth is probably not the best way to do this, but it's simple and works for now
    const auth = c.req.header("Authorization");
    if (!auth) {
        return c.json("Unauthorized", 401);
    }
    const [type, token] = auth.split(" ");
    if (token !== c.env.AUTH_TOKEN) {
        return c.json("Unauthorized", 401);
    }

    const { lang, course, unit, number } = c.req.param();
    const answer = await c.req.json();
    const ans = await c.env.DB.prepare(
        "SELECT answer FROM answers WHERE language = ? AND course = ? AND unit = ? AND number = ?"
    )
        .bind(lang, course, unit, number)
        .first();
    if (!ans) {
        await c.env.DB.prepare(
            "INSERT INTO answers (language, course, unit, number, answer) VALUES (?, ?, ?, ?, ?)"
        )
            .bind(lang, course, unit, number, answer)
            .run();
    } else {
        await c.env.DB.prepare(
            "UPDATE answers SET answer = ? WHERE language = ? AND course = ? AND unit = ? AND number = ?"
        )
            .bind(answer, lang, course, unit, number)
            .run();
    }
    return c.json(answer);
});

export default app;
