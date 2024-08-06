<?php

require_once(__DIR__ . '/../vendor/autoload.php');

use Appwrite\Client;
use Appwrite\Services\Users;

// This Appwrite function will be executed every time your function is triggered
return function ($context) {
    // You can use the Appwrite SDK to interact with other services
    // For this example, we're using the Users service
    $client = new Client();
    $client
        ->setEndpoint(getenv('APPWRITE_FUNCTION_API_ENDPOINT'))
        ->setProject(getenv('APPWRITE_FUNCTION_PROJECT_ID'))
        ->setKey($context->req->headers['x-appwrite-key']);
    $users = new Users($client);

    try {
        $response = $users->list();
        // Log messages and errors to the Appwrite Console
        // These logs won't be seen by your end users
        $context->log('Total users: ' . $response['total']);
    } catch(Throwable $error) {
        $context->error('Could not list users: ' . $error->getMessage());
    }

    // The req object contains the request data
    if ($context->req->path === '/ping') {
        // Use res object to respond with text(), json(), or binary()
        // Don't forget to return a response!
        return $context->res->text('Pong');
    }

    return $context->res->json([
        'motto' => 'Build like a team of hundreds_',
        'learn' => 'https://appwrite.io/docs',
        'connect' => 'https://appwrite.io/discord',
        'getInspired' => 'https://builtwith.appwrite.io',
    ]);
};
