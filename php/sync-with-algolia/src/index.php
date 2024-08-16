<?php

require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . '/utils.php');

use Appwrite\Client;
use Appwrite\Services\Databases;
use Appwrite\Query;
use Algolia\AlgoliaSearch\SearchClient;

return function ($context) {
    throw_if_missing($_ENV, [
        'APPWRITE_API_KEY',
        'APPWRITE_DATABASE_ID',
        'APPWRITE_COLLECTION_ID',
        'ALGOLIA_APP_ID',
        'ALGOLIA_INDEX_ID',
        'ALGOLIA_ADMIN_API_KEY',
        'ALGOLIA_SEARCH_API_KEY'
    ]);

    if ($context->req->method === 'GET') {
        $html = interpolate(get_static_file('index.html'), [
            'ALGOLIA_APP_ID' => $_ENV['ALGOLIA_APP_ID'],
            'ALGOLIA_INDEX_ID' => $_ENV['ALGOLIA_INDEX_ID'],
            'ALGOLIA_SEARCH_API_KEY' => $_ENV['ALGOLIA_SEARCH_API_KEY'],
        ]);
        return $context->res->text($html, 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    $client = new Client();
    $client
        ->setEndpoint('https://cloud.appwrite.io/v1')
        ->setProject($_ENV['APPWRITE_FUNCTION_PROJECT_ID'])
        ->setKey($_ENV['APPWRITE_API_KEY']);

    $databases = new Databases($client);

    $algolia = SearchClient::create(
        $_ENV['ALGOLIA_APP_ID'],
        $_ENV['ALGOLIA_ADMIN_API_KEY']
    );
    $index = $algolia->initIndex($_ENV['ALGOLIA_INDEX_ID']);

    $cursor = null;
    do {
        $queries = [Query::limit(100)];

        if ($cursor) {
            array_push($queries, Query::cursorAfter($cursor));
        }

        $response = $databases->listDocuments(
            $_ENV['APPWRITE_DATABASE_ID'],
            $_ENV['APPWRITE_COLLECTION_ID'],
            $queries
        );

        if (count($response['documents']) > 0) {
            $cursor = $response['documents'][count($response['documents']) - 1]['$id'];
        } else {
            $context->log('No more documents found.');
            $cursor = null;
            break;
        }

        $context->log('Syncing chunk of ' . count($response['documents']) . ' documents...');

        $documentsWithObjectId = array_map(function ($document) {
            $document['objectID'] = $document['$id'];
            unset($document['$id']);
            return $document;
        }, $response['documents']);

        $index->saveObjects($documentsWithObjectId);
    } while ($cursor !== null);

    $context->log('Sync finished.');

    return $context->res->text('Sync finished.', 200);
};
