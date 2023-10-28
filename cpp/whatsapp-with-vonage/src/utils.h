#ifndef UTILS_H
#define UTILS_H

#include <curl/curl.h>
#include <json/json.h>
#include <jwt-cpp/jwt.h>

#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>

static std::string base64Encode(const std::string& in) {
    std::string out;
    int val = 0, valb = -6;
    for (unsigned char c : in) {
        val = (val << 8) + c;
        valb += 8;
        while (valb >= 0) {
            out.push_back(
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345"
                "6789+/"[(val >> valb) & 0x3F]);
            valb -= 6;
        }
    }
    if (valb > -6)
        out.push_back(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
            "+/"[((val << 8) >> (valb + 8)) & 0x3F]);
    while (out.size() % 4) out.push_back('=');
    return out;
}

static std::string sha256(const char* string) {
    char outputBuffer[65];
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, string, strlen(string));
    SHA256_Final(hash, &sha256);
    int i = 0;
    for (i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        sprintf(outputBuffer + (i * 2), "%02x", hash[i]);
    }
    outputBuffer[64] = 0;
    return std::string(outputBuffer);
}

static Json::Value stringToJson(const std::string& jsonStr) {
    Json::Value res;
    Json::Reader reader;
    bool ok = reader.parse(jsonStr, res, false);
    if (!ok) {
        throw std::runtime_error("Failed to parse JSON string.");
    }
    return res;
}

static const char* getStaticFile(std::string filename) {
    // Serving string directly because of the issue with serving static assets
    // in cpp template
    const char* content = R"(
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WhatsApp Bot with Vonage</title>

    <link rel="stylesheet" href="https://unpkg.com/@appwrite.io/pink" />
    <link rel="stylesheet" href="https://unpkg.com/@appwrite.io/pink-icons" />
  </head>
  <body>
    <main class="main-content">
      <div class="top-cover u-padding-block-end-56">
        <div class="container">
          <div
            class="u-flex u-gap-16 u-flex-justify-center u-margin-block-start-16"
          >
            <h1 class="heading-level-1">WhatsApp Bot with Vonage</h1>
            <code class="u-un-break-text"></code>
          </div>
          <p
            class="body-text-1 u-normal u-margin-block-start-8"
            style="max-width: 50rem"
          >
            This function listens to incoming webhooks from Vonage regarding
            WhatsApp messages, and responds to them. To use the function, send
            message to the WhatsApp user provided by Vonage.
          </p>
        </div>
      </div>
    </main>
  </body>
</html>
    )";
    return content;
}

static std::string checkEnvVars(const std::vector<std::string>& envVarNames) {
    std::vector<std::string> missingVars;
    for (const std::string& varName : envVarNames) {
        const char* varValue = std::getenv(varName.c_str());
        if (varValue == nullptr) {
            missingVars.push_back(varName);
        }
    }
    if (!missingVars.empty()) {
        std::string error = "Missing environment variables: ";
        for (const std::string& missingVar : missingVars) {
            error += missingVar;
            error += ", ";
        }
        error = error.substr(0, error.length() - 2);
        return error;
    }
    return "";
}

#endif