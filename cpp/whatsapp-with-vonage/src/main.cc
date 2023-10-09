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
    static void checkEnvVars(runtime::RuntimeContext& context,
                             const std::vector<std::string>& envVarNames) {
        std::vector<std::string> missingVars;
        context.log("Checking for missing environment variables:");
        for (const std::string& varName : envVarNames) {
            context.log(varName.c_str());
            const char* varValue = std::getenv(varName.c_str());
            if (varValue == nullptr) {
                context.error(varName.c_str());
                missingVars.push_back(varName);
            }
        }

        if (!missingVars.empty()) {
            context.error("Error: Missing environment variables:");
            for (const std::string& missingVar : missingVars) {
                std::cerr << " " << missingVar;
            }
            std::cerr << std::endl;
            throw std::runtime_error("Missing environment variables.");
        }
    }

    static RuntimeOutput main(RuntimeContext& context) {
        RuntimeRequest req = context.req;
        RuntimeResponse res = context.res;

        context.log("Hello, Logs!");
        // checkEnvVars(context, {
        //                           "VONAGE_API_KEY",
        //                           "VONAGE_API_SECRET",
        //                           "VONAGE_API_SIGNATURE_SECRET",
        //                           "VONAGE_WHATSAPP_NUMBER",
        //                       });
        // // If something goes wrong, log an error
        context.error("Hello, Errors!");
        // context.log(serveStaticFile(context, "index.html"));
        std::vector<std::string> files = listFiles("/usr/local");
        // std::vector<std::string> files = listFiles("/usr/local");
        for (const std::string& file : files) context.log(file);
        if (req.method == "GET") {
            std::string indexHtml = getStaticFile("index.html");
            context.log(indexHtml);
            return res.send(indexHtml);
        }

        Json::Value payload = stringToJson(req.bodyRaw);
        context.log(payload.toStyledString());

        std::vector<std::string> requiredFields = {"from", "text"};
        std::vector<std::string> missingFields;
        for (const std::string& field : requiredFields)
            if (!payload.isMember(field)) missingFields.push_back(field);

        if (!missingFields.empty()) {
            Json::Value response;
            std::string error = "Missing required fields";
            int i = 0;
            for (const std::string& field : missingFields) {
                error += field;
                if (i++ < missingFields.size() - 1) error += ", ";
            }
            context.error(error);
            response["error"] = error;
            response["ok"] = false;
            return res.json(response, 400);
        }

        std::string token = req.headers["authorization"].asString();
        int space = token.find(" ");
        token = token.substr(space + 1);

        auto verifier = jwt::verify().allow_algorithm(
            jwt::algorithm::hs256(std::getenv("VONAGE_API_SIGNATURE_SECRET")));

        auto decoded = jwt::decode(token);
        verifier.verify(decoded);
        std::string bodyHash = sha256(req.bodyRaw.c_str());
        Json::Value jwtBody = stringToJson(decoded.get_payload());
        context.log(jwtBody.toStyledString());
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
            /* Check for errors */
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
