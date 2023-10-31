import express from "express"
import jwt from "jsonwebtoken"
import path from "path"

const app = express();
app.use(express.json())
app.listen(PORT, () => console.log("ready"))

app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"))

})


const secret = `${Bun.env.VONAGE_API_KEY}:${Bun.env.VONAGE_ACCOUNT_SECRET}`;
const basicAuthToken = btoa(secret);



function verify(req, res, next) {
  const authHeader = req.headers.authorization.split(' ')[1];
  jwt.verify(authHeader, Bun.env.SIGNATURE_SECRET, { algorithms: ['HS256'] }, (err, response) => {

    if (err) {
       return response.json({
                status:'400',
                message:"couldn't verify"
            });
    }

    next();
  })

}


app.post("/", verify, async (req, res) => {
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
      status:'200',
      message: req.body.status
 })
})
