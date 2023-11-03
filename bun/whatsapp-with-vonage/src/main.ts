import jwt from "jsonwebtoken";
import { fetch, Headers } from "fetch-undici";

export default async ({ req, res, log, error }) => {
     if (req.method === "GET") {
          const fileName = Bun.resolveSync("../static/index.html", import.meta.dir);
          const html = await Bun.file(fileName).text();

          return res.send(html, 200, {
               "Content-Type": "text/html; charset=utf-8",
          });
     }

     if (req.method === "POST") {
          const secret = `${Bun.env.VONAGE_API_KEY}:${Bun.env.VONAGE_ACCOUNT_SECRET}`;
          const basicAuthToken = btoa(secret);
          const authHeader = req.headers.authorization.split(" ")[1];
          await jwt.verify(
               authHeader,
               Bun.env.SIGNATURE_SECRET,
               { algorithms: ["HS256"] },
               (error, decodedToken) => {
                    if (error) {
                         return res.json(
                              {
                                   ok: false,
                                   error: "can't verify",
                              },
                              400,
                         );
                    }
               },
          );

          const myHeaders = new Headers();
          myHeaders.append("Accept", "application/json");
          myHeaders.append("Content-Type", "application/json");
          myHeaders.append("Authorization", `Basic ${basicAuthToken}`);

          const bodyContent = JSON.stringify({
               from: `${Bun.env.FROM_NUMBER}`,
               to: `${req.body.from}`,
               message_type: "text",
               text: `you sent me: ${req.body.text}`,
               channel: "whatsapp",
          });

          const requestOptions = {
               method: "POST",
               headers: myHeaders,
               body: bodyContent,
          };
          if (!(req.body.text == null)) {
               await fetch(
                    "https://messages-sandbox.nexmo.com/v1/messages",
                    requestOptions,
               );
          }

          return res.json(
               {
                    ok: true,
                    status: req.body.status,
               },
               200,
          );
     }

     return res.json({
          motto: "Build like a team of hundreds_",
          learn: "https://appwrite.io/docs",
          connect: "https://appwrite.io/discord",
          getInspired: "https://builtwith.appwrite.io",
     });
};


