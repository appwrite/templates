#include <curl/curl.h>
#include <json/value.h>
#include <jwt-cpp/jwt.h>

#include <any>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>

#include "../RuntimeContext.h"
#include "../RuntimeOutput.h"
#include "../RuntimeRequest.h"
#include "../RuntimeResponse.h"
#include "utils.h"

namespace runtime {
class Handler {
   public:
    static RuntimeOutput main(RuntimeContext& context) {
        RuntimeRequest req = context.req;
        RuntimeResponse res = context.res;

        std::string error = checkEnvVars({
            "VONAGE_API_KEY",
            "VONAGE_API_SECRET",
            "VONAGE_API_SIGNATURE_SECRET",
            "VONAGE_WHATSAPP_NUMBER",
        });
        if (error != "") {
            context.error(error);
            Json::Value response;
            response["error"] = error;
            response["ok"] = false;
            return res.json(response, 500);
        }

        if (req.method == "GET") {
            std::string indexHtml = getStaticFile("index.html");
            Json::Value headers;
            headers["Content-Type"] = "text/html; charset=utf-8";
            return res.send(indexHtml, 200, headers);
        }

        Json::Value payload = stringToJson(req.bodyRaw);
        context.log("Payload from webhook\n" + payload.toStyledString());
        std::vector<std::string> requiredFields = {"from", "text"};
        std::vector<std::string> missingFields;

        for (const std::string& field : requiredFields)
            if (!payload.isMember(field)) missingFields.push_back(field);
        if (!missingFields.empty()) {
            std::string error = "Missing required fields";
            int i = 0;
            for (const std::string& field : missingFields) {
                error += field;
                if (i++ < missingFields.size() - 1) error += ", ";
            }
            context.error(error);
            Json::Value response;
            response["error"] = error;
            response["ok"] = false;
            return res.json(response, 400);
        }

        std::string token = req.headers["authorization"].asString();
        int space = token.find(" ");
        token = token.substr(space + 1);
        jwt::verifier<jwt::default_clock, jwt::traits::kazuho_picojson>
            verifier = jwt::verify().allow_algorithm(jwt::algorithm::hs256(
                std::getenv("VONAGE_API_SIGNATURE_SECRET")));

        jwt::decoded_jwt<jwt::traits::kazuho_picojson> decoded =
            jwt::decode(token);
        verifier.verify(decoded);

        std::string bodyHash = sha256(req.bodyRaw.c_str());
        Json::Value jwtBody = stringToJson(decoded.get_payload());

        if (strcmp(jwtBody["payload_hash"].asCString(), bodyHash.c_str()) !=
            0) {
            context.error("Payload hash mismatch.");
            Json::Value response;
            response["error"] = "Payload hash mismatch.";
            response["ok"] = false;
            return res.json(response, 401);
        }

        std::string apiKey = std::getenv("VONAGE_API_KEY");
        std::string apiSecret = std::getenv("VONAGE_API_SECRET");
        std::string basicAuthToken = base64Encode(apiKey + ":" + apiSecret);

        CURL* curl;
        CURLcode ret;
        curl = curl_easy_init();
        struct curl_slist* headers = NULL;
        std::string url = "https://messages-sandbox.nexmo.com/v1/messages";

        if (curl) {
            headers =
                curl_slist_append(headers, "Content-Type: application/json");
            std::string authHeader = "Authorization: Basic " + basicAuthToken;
            headers = curl_slist_append(headers, authHeader.c_str());
            curl_easy_setopt(curl, CURLOPT_URL,
                             "https://messages-sandbox.nexmo.com/v1/messages");
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
            Json::Value reqBody;
            reqBody["from"] = getenv("VONAGE_WHATSAPP_NUMBER");
            reqBody["to"] = payload["from"];
            reqBody["message_type"] = "text";
            reqBody["text"] =
                "Hi there! You sent me: " + payload["text"].asString();
            reqBody["channel"] = "whatsapp";

            std::string data = reqBody.toStyledString();
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, data.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, data.length());
            curl_easy_setopt(curl, CURLOPT_POST, 1);
            ret = curl_easy_perform(curl);
            if (ret != CURLE_OK) {
                context.error(curl_easy_strerror(ret));
                Json::Value response;
                response["error"] = curl_easy_strerror(ret);
                response["ok"] = false;
                return res.json(response, 500);
            }
            curl_easy_cleanup(curl);
            curl = NULL;
            curl_slist_free_all(headers);
            headers = NULL;
        }

        Json::Value response;
        response["ok"] = true;
        return res.json(response);
    }
};
}  // namespace runtime
