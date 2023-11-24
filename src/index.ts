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

app.get("/", async (c) => {
    const ans = await c.env.DB.prepare(
        "SELECT DISTINCT language FROM answers"
    ).all();
    return c.json(
        ans.results.map((a) => ({
            ...a,
            url: `${c.req.url}${a.language}/`,
        }))
    );
});

app.get("/:lang/", async (c) => {
    // List all courses in a language
    const { lang } = c.req.param();
    const ans = await c.env.DB.prepare(
        "SELECT DISTINCT course FROM answers WHERE language = ?"
    )
        .bind(lang)
        .all();
    return c.json(
        ans.results.map((a) => ({
            ...a,
            url: `${c.req.url}${a.course}/`,
        }))
    );
});

app.get("/:lang/:course/", async (c) => {
    // List all units in a course
    const { lang, course } = c.req.param();
    const ans = await c.env.DB.prepare(
        "SELECT DISTINCT unit FROM answers WHERE language = ? AND course = ?"
    )
        .bind(lang, course)
        .all();
    return c.json(
        ans.results.map((a) => ({
            ...a,
            url: `${c.req.url}${(a.unit as string).replace(" ", "%20")}/`,
        }))
    );
});

app.get("/:lang/:course/:unit/", async (c) => {
    // List all titles in a unit
    const { lang, course, unit } = c.req.param();
    const ans = await c.env.DB.prepare(
        "SELECT DISTINCT title FROM answers WHERE language = ? AND course = ? AND unit = ?"
    )
        .bind(lang, course, unit)
        .all();
    return c.json(
        ans.results.map((a) => ({
            ...a,
            url: `${c.req.url}${((a.title || "") as string).replace(" ", "%20")}/`,
        }))
    );
});

app.get("/:lang/:course/:unit/:title/", async (c) => {
    const { lang, course, unit, title } = c.req.param();
    const ans = await c.env.DB.prepare(
        "SELECT number, answer FROM answers WHERE language = ? AND course = ? AND unit = ? AND title = ?"
    )
        .bind(lang, course, unit, title)
        .all();

    // Return indexes of answers, add URL to each answer
    return c.json(
        ans.results.map((a) => ({
            ...a,
            answer: JSON.parse(a.answer as string),
            url: `${c.req.url}${a.number}`,
        }))
    );
});

app.get("/:lang/:course/:unit/:title/:number", async (c) => {
	const { lang, course, unit, title, number } = c.req.param();
	const ans = await c.env.DB.prepare(
		"SELECT answer FROM answers WHERE language = ? AND course = ? AND unit = ? AND title = ? AND number = ?"
	)
		.bind(lang, course, unit, title, number)
		.first();
	if (!ans) {
		return c.json([], 404);
	}
	return c.json(JSON.parse(ans.answer as string));
});

app.put("/:lang/:course/:unit/:title/:number", async (c) => {
    // Basic auth is probably not the best way to do this, but it's simple and works for now
    const auth = c.req.header("Authorization");
    if (!auth) {
        return c.json("Unauthorized", 401);
    }
    const [type, token] = auth.split(" ");
    if (token !== c.env.AUTH_TOKEN) {
        return c.json("Unauthorized", 401);
    }

    const { lang, course, unit, title, number } = c.req.param();
    const answer = JSON.stringify(await c.req.json());
    const ans = await c.env.DB.prepare(
        "SELECT answer FROM answers WHERE language = ? AND course = ? AND unit = ? AND title = ? AND number = ?"
    )
        .bind(lang, course, unit, title, number)
        .first();
    if (!ans) {
        await c.env.DB.prepare(
            "INSERT INTO answers (language, course, unit, title, number, answer) VALUES (?, ?, ?, ?, ?, ?)"
        )
            .bind(lang, course, unit, title, number, answer)
            .run();
    } else {
        await c.env.DB.prepare(
            "UPDATE answers SET answer = ? WHERE language = ? AND course = ? AND unit = ? AND title = ? AND number = ?"
        )
            .bind(answer, lang, course, unit, title, number)
            .run();
    }
    return c.json(JSON.parse(answer));
});

export default app;
