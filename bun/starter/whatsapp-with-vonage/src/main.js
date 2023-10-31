import jwt from 'jsonwebtoken';


export default async ({ req, res, log, error }) => {

    const html = file("public/index.html")
    if (req.method === "GET") {
        return res.send(html, {
            satus: 200,
            headers: {
                "Content-Type": "text/html",
            },
        });

    }



   if (req.method === "POST") {
        const secret = `${Bun.env.VONAGE_API_KEY}:${Bun.env.VONAGE_API_SECRET}`;
        const basicAuthToken = btoa(secret);
        const authHeader = req.headers.authorization.split(' ')[1];
        jwt.verify(authHeader, process.env.SIGNATURE_SECRET, { algorithms: ['HS256'] }, (error, response) => {

            if (error) {
                return response.json({
                    ok: false,
                    error: "can't verify"

                }, 400);
            }


        })

        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Basic ${basicAuthToken}`);

        const raw = JSON.stringify({
            from: `${Bun.env.FROM_NUMBER}`,
            to: `${req.body.from}`,
            message_type: "text",
            text: `you sent me: ${req.body.text}`,
            channel: "whatsapp"
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,

        };
        if (!(req.body.text == null)) {
            await fetch("https://messages-sandbox.nexmo.com/v1/messages", requestOptions)
        }
        res.json({
            ok: true,
            status:req.body.status



        }, 200)
    }



}

