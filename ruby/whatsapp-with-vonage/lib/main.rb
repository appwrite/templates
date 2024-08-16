require 'jwt'
require 'httparty'
require 'json'
require 'digest/sha2'
require_relative 'utils'

def main(context)
  throw_if_missing(
    ENV,
    [
      "VONAGE_API_KEY",
      "VONAGE_API_SECRET",
      "VONAGE_API_SIGNATURE_SECRET",
      "VONAGE_WHATSAPP_NUMBER"
    ]
  )

  if context.req.method == "GET"
    return context.res.text(
      get_static_file("index.html"),
      200,
      { "content-type" => "text/html" }
    )
  end

  body = context.req.body
  headers = context.req.headers
  token = (headers["authorization"] || "").split(" ")[1]

  decoded = JWT.decode(token, ENV["VONAGE_API_SIGNATURE_SECRET"], true, algorithm: "HS256")

  if Digest::SHA256.hexdigest(context.req.body_raw) != decoded[0]["payload_hash"] 
    return context.res.json({ "ok" => false, "error" => "Payload hash mismatch." }, 400)
  end

  begin
    throw_if_missing(body, ["from", "text"]) 
  rescue StandardError => e
    return context.res.json({ "ok" => false, "error" => e.message }, 400)
  end

  headers = {
    "Content-Type" => "application/json",
    "Accept" => "application/json"
  }

  data = {
    "from" => ENV["VONAGE_WHATSAPP_NUMBER"],
    "to" => body["from"],
    "message_type" => "text",
    "text" => "Hi there! You sent me: #{body["text"]}",
    "channel" => "whatsapp"
  }

  url = "https://messages-sandbox.nexmo.com/v1/messages"
  response = HTTParty.post(
    url,
    headers: headers,
    body: data.to_json,
    basic_auth: { username: ENV["VONAGE_API_KEY"], password: ENV["VONAGE_API_SECRET"] }
  )

  if response.success?
    return context.res.json({ "ok" => true })
  else
    context.error("Error #{response.body}")
    return context.res.json({ "ok" => false }, 500)
  end
end