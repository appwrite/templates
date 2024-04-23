<?php

require_once(__DIR__ . '/../vendor/autoload.php');
require_once(__DIR__ . 'utils.php');
require_once(__DIR__ . 'cors.php');

$ERROR_CODE = [
    'INVALID_REQUEST' => 'invalid-request',
    'MISSING_FORM_FIELDS' => 'missing-form-fields',
    'SERVER_ERROR' => 'server-error',
];

return function ($context) {
    global $ERROR_CODE;

    throw_if_missing($_ENV, [
        'SUBMIT_EMAIL',
        'SMTP_HOST',
        'SMTP_USERNAME',
        'SMTP_PASSWORD',
    ]);

    if (!getenv('ALLOWED_ORIGINS') || getenv('ALLOWED_ORIGINS') === '*') {
        $context->log(
            'WARNING: Allowing requests from any origin - this is a security risk!'
        );
    }

    if ($context->req->method === 'GET' && $context->req->path === '/') {
        return $context->send(get_static_file('index.html'), 200, [
            'content-type' => 'text/html; charset=utf-8',
        ]);
    }

    if ($context->req->headers['content-type'] !== 'application/x-www-form-urlencoded') {
        $context->error('Incorrect content type.');
        return $context->redirect(
            $context->req->headers['referer'] + "?code=" + $ERROR_CODE['INVALID_REQUEST']
        );
    }

    if (!is_origin_permitted($context->req)) {
        $context->error('Origin not permitted.');
        return $context->redirect(
            $context->req->headers['referer'] + "?code=" + $ERROR_CODE['INVALID_REQUEST']
        );
    }

    $form = [];
    parse_str($context->req->body, $form);

    try {
        throw_if_missing($form, ['email']);
    } catch (Exception $err) {
        return $context->redirect(
            $context->req->headers['referer'] + "?code=" + $err->getMessage()
        );
    }

    try {
        send_email([
            'to' => $_ENV['SUBMIT_EMAIL'],
            'from' => $_ENV['SMTP_USERNAME'],
            'subject' => 'New form submission: ' . $context->req->headers['referer'],
            'text' => template_form_message($form),
        ]);
    } catch (Exception $err) {
        $context->error($err->getMessage());
        return $context->redirect(
            $context->req->headers['referer'] + "?code=" + $ERROR_CODE['SERVER_ERROR']
        );
    }

    if (!isset($form['_next']) || empty($form['_next'])) {
        return $context->send(get_static_file('success.html'), 200, [
            'content-type' => 'text/html; charset=utf-8',
        ]);
    }

    return $context->redirect(
        $context->req->headers['referer'] + $form['_next'],
        301,
        get_cors_headers($context->req)
    );
};
