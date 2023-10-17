<?php

require(__DIR__ . '/../vendor/autoload.php');
require(__DIR__ . '/utils.php');

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

return function ($context) {
    throw_if_missing($_ENV, [
        'VONAGE_API_KEY',
        'VONAGE_API_SECRET',
        'VONAGE_API_SIGNATURE_SECRET',
        'VONAGE_WHATSAPP_NUMBER',
    ]);

    if ($context->req->method === 'GET') {
            return $context->res->send(get_static_file('index.html'), 200, [
                'Content-Type' => 'text/html; charset=utf-8',
            ]);
        }

    $authorizationHeader = isset($context->req->headers["authorization"]) ? $context->req->headers["authorization"] : "";
    $jwtToken = explode(" ", $authorizationHeader)[1] ?? "";

    $decoded = JWT::decode($jwtToken, new Key($_ENV['VONAGE_API_SIGNATURE_SECRET'], 'HS256'));
    $decoded_array = (array) $decoded;

    if (hash("sha256",$context->req->bodyRaw) !== $decoded_array["payload_hash"]) {
        $context->res->json ([
            'ok' => false,
            'error' => "Payload Mismatch"
        ], 401);
    };

    try {
        throw_if_missing($context->req->body, ['from','text']);
        } catch (\Exception $e) {
            $context->res->json([
                'ok'=> false,
                'error'=> $e,
            ], 400);
        }   

    $headers = [
        'Content-Type' => 'application/json',
        'Accept' => 'application/json'
    ];
    
    $data = [
        'from' => $_ENV['VONAGE_WHATSAPP_NUMBER'],
        'to' => $context->req->body['from'],
        'message_type' => 'text',
        'text' => 'Hi there, you sent me: ' . $context->req->body['text'],
        'channel' => 'whatsapp'
    ];
    
    $url = 'https://messages-sandbox.nexmo.com/v1/messages';
    
    
    $ch = curl_init();
    
    $headers = array(
        'Content-Type: application/json',
        'Accept: application/json'
    );
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_USERPWD, $_ENV['VONAGE_API_KEY'] . ':' . $_ENV['VONAGE_API_SECRET']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    try {
        curl_exec($ch);
    } catch (Exception $e) {
        $context->error('Caught exception: ', $e);
    }

    curl_close($ch);
};
