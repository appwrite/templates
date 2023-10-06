<?php

require(__DIR__ . '/../vendor/autoload.php');
require(__DIR__ . '/utils.php');

use Appwrite\Client as AppwriteClient;
use Appwrite\Services\Databases;
use Appwrite\Query;
use MeiliSearch\Client;

return function ($context) {
    throw_if_missing($_ENV, [
        'APPWRITE_API_KEY',
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

        return $context->res->send($html, 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    $appwriteClient = new AppwriteClient();
    $appwriteClient
        ->setEndpoint('https://cloud.appwrite.io/v1')
        ->setProject($_ENV['APPWRITE_PROJECT_ID'])
        ->setKey($_ENV['APPWRITE_API_KEY']);

    $databases = new Databases($appwriteClient);

    $meiliSearchClient = new Client($_ENV['MEILISEARCH_ENDPOINT'], $_ENV['MEILISEARCH_ADMIN_API_KEY']);

    $index = $meiliSearchClient->index($_ENV['MEILISEARCH_INDEX_NAME']);

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

    return $context->res->send('Sync complete', 200);
};
