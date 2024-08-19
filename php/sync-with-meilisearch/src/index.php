<?php

require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . '/utils.php');

use Appwrite\Client;
use Appwrite\Services\Databases;
use MeiliSearch\Client as MeiliSearch;

return function ($context) {
    throw_if_missing($_ENV, [
        'APPWRITE_DATABASE_ID',
        'APPWRITE_COLLECTION_ID',
        'MEILISEARCH_ENDPOINT',
        'MEILISEARCH_INDEX_NAME',
        'MEILISEARCH_ADMIN_API_KEY',
        'MEILISEARCH_SEARCH_API_KEY',
    ]);

    if ($context->req->method === 'GET') {
        $html = interpolate(get_static_file('index.html'), [
            'MEILISEARCH_ENDPOINT' => $_ENV['MEILISEARCH_ENDPOINT'],
            'MEILISEARCH_INDEX_NAME' => $_ENV['MEILISEARCH_INDEX_NAME'],
            'MEILISEARCH_SEARCH_API_KEY' => $_ENV['MEILISEARCH_SEARCH_API_KEY'],
        ]);

        return $context->res->text($html, 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    $client = new Client();
    $client
        ->setEndpoint($_ENV['APPWRITE_FUNCTION_API_ENDPOINT'])
        ->setProject($_ENV['APPWRITE_PROJECT_ID'])
        ->setKey($context->req->headers['x-appwrite-key'] ?? '');

    $databases = new Databases($client);

    $meilisearch = new MeiliSearch($_ENV['MEILISEARCH_ENDPOINT'], $_ENV['MEILISEARCH_ADMIN_API_KEY']);

    $index = $meilisearch->index($_ENV['MEILISEARCH_INDEX_NAME']);

    $cursor = null;

    do {
        $queries = ['limit' => 100];

        if ($cursor) {
            $queries['cursorAfter'] = $cursor;
        }

        $response = $databases->listDocuments($_ENV['APPWRITE_DATABASE_ID'], $_ENV['APPWRITE_COLLECTION_ID'], $queries);

        $documents = $response['documents'];

        if (count($documents) > 0) {
            $cursor = end($documents)['$id'];
        } else {
            $context->log('No documents found');
            $cursor = null;
            break;
        }

        $context->log('Syncing chunk of ' . count($response['documents']) . ' documents...');
        $index->addDocuments($documents);
    } while ($cursor !== null);

    $context->log('Sync complete');

    return $context->res->text('Sync complete', 200);
};
