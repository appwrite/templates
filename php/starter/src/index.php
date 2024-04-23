<?php

require_once(__DIR__ . '/../vendor/autoload.php');

// use Appwrite\Client;
// use Appwrite\Exception;

// This is your Appwrite function
// It's executed each time we get a request
return function ($context) {
    // Why not try the Appwrite SDK?
    //
    // $client = new Client();
    // $client
    //     ->setEndpoint('https://cloud.appwrite.io/v1')
    //     ->setProject(getenv('APPWRITE_FUNCTION_PROJECT_ID'))
    //      ->setKey(getenv('APPWRITE_API_KEY'));

    // You can log messages to the console
    $context->log('Hello, Logs!');

    // If something goes wrong, log an error
    $context->error('Hello, Errors!');

    // The `req` object contains the request data
    if ($context->req->method === 'GET') {
        // Send a response with the res object helpers
        // `res.send()` dispatches a string back to the client
        return $context->res->send('Hello, World!');
    }

    // `res.json()` is a handy helper for sending JSON
    return $context->res->json([
        'motto' => 'Build like a team of hundreds_',
        'learn' => 'https://appwrite.io/docs',
        'connect' => 'https://appwrite.io/discord',
        'getInspired' => 'https://builtwith.appwrite.io',
    ]);
};
