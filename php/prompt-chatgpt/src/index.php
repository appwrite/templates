<?php

require(__DIR__ . '/../vendor/autoload.php');

return function ($context) {
    throw_if_missing($_ENV, ['OPENAI_API_KEY']);

    if ($context->req->method === 'GET') {
        return $context->res->send(get_static_file('index.html'), 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    try {
        throw_if_missing($context->req->body, ['prompt']);
    } catch (Exception $e) {
        return $context->res->json(['ok' => False, 'error' => $e->getMessage()], 400);
    }

    $openai = OpenAI::client($_ENV['OPENAI_API_KEY']);

    try {
        $response = $openai->chat()->create([
            'model' => 'gpt-3.5-turbo',
            'max_tokens' => $_ENV['MAX_TOKENS'] ?: 150,
            'messages' => [
                ['role' => 'user', 'content' => $context->req->body['prompt']]
            ],
        ]);

        $completion = $response['choices'][0]['message']['content'];
        return $context->res->json(['ok' => True, 'completion' => $completion], 200, [
            'Content-Type' => 'text/plain',
        ]);
    } catch (Exception $e) {
        return $context->res->json(['ok' => False, 'error' => 'Failed to query model.'], 500);
    }
};
