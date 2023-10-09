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

static std::vector<std::string> listFiles(std::string path) {
    // recurisve traverse
    std::vector<std::string> files;
    for (const auto& entry : std::filesystem::directory_iterator(path)) {
        if (entry.is_directory()) {
            std::vector<std::string> subFiles = listFiles(entry.path());
            files.insert(files.end(), subFiles.begin(), subFiles.end());
        } else {
            files.push_back(entry.path());
        }
    }
    return files;
}

static std::string getStaticFile(std::string filename) {
    std::string staticPath = "/usr/local/static/" + filename;
    std::ifstream file;
    file.open(staticPath);
    if (!file.is_open()) {
        throw std::runtime_error("File not found.");
    }
    std::string content((std::istreambuf_iterator<char>(file)),
                        (std::istreambuf_iterator<char>()));
    return content;
}

// static std::string serveStaticFile(runtime::RuntimeContext& context,
//                                        std::string filename) {
//         std::ifstream file;
//         // std::string path = std::filesystem::current_path();
//         std::string path = "/usr/local/server/src/function";
//         context.log(path);
//         context.log("........");
//         // for (const auto& entry :
//         std::filesystem::directory_iterator(path))
//         //     context.log(entry.path());
//         std::vector<std::string> files = listFiles(path);
//         for (const std::string& file : files) context.log(file);
//         file.open(filename);
//         if (!file.is_open()) {
//             throw std::runtime_error("File not found.");
//         }
//         std::string content((std::istreambuf_iterator<char>(file)),
//                             (std::istreambuf_iterator<char>()));
//         return content;
//     }

#endif