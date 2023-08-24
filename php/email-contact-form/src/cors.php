<?php

function is_origin_permitted(mixed $req): bool
{
    if (
        !getenv('ALLOWED_ORIGINS') ||
        getenv('ALLOWED_ORIGINS') === '*' ||
        !$req->headers['origin']
    ) {
        return true;
    }
    $allowedOriginsArray = explode(',', getenv('ALLOWED_ORIGINS'));
    return in_array($req->headers['origin'], $allowedOriginsArray);
}

function get_cors_headers(mixed $req): array
{
    if (!$req->headers['origin']) {
        return [];
    }
    return [
        'Access-Control-Allow-Origin' =>
        !getenv('ALLOWED_ORIGINS') || getenv('ALLOWED_ORIGINS') === '*'
            ? '*'
            : $req->headers['origin'],
    ];
}
