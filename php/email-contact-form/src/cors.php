<?php

/**
 * Returns true if the origin is allowed to make requests to this endpoint
 * @param mixed $req
 * @return bool
 */
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

/**
 * Returns the CORS headers for the request
 * @param mixed $req
 * @return array
 */
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
