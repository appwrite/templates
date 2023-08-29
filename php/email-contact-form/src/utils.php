<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$staticFolder = dirname(__FILE__) . '/../static';

/**
 * Returns the contents of a file in the static folder
 * @param string $fileName
 * @return string Contents of static/{$fileName}
 */
function get_static_file(string $fileName): string
{
    global $staticFolder;
    $file = $staticFolder . '/' . $fileName;
    return file_get_contents($file);
}

/**
 * Throws an exception if any of the keys are missing from the object
 * @param array|object $obj
 * @param string[] $keys
 * @throws \Exception
 */
function throw_if_missing(mixed $obj, array $keys): void
{
    $missing = [];
    foreach ($keys as $key) {
        if (!isset($obj[$key]) || empty($obj[$key])) {
            $missing[] = $key;
        }
    }
    if (count($missing) > 0) {
        throw new \Exception('Missing required fields: ' . implode(', ', $missing));
    }
}

/**
 * Sends an email using the SMTP credentials in the environment
 * @param array $options
 * @throws \PHPMailer\PHPMailer\Exception
 */
function send_email(array $options): void
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $_ENV['SMTP_HOST'];
    $mail->Port = $_ENV['SMTP_PORT'] ?? 587;
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USERNAME'];
    $mail->Password = $_ENV['SMTP_PASSWORD'];

    $mail->setFrom($options['from']);
    $mail->addAddress($options['to']);
    $mail->Subject = $options['subject'];
    $mail->Body = $options['body'];

    $mail->send();
}

/**
 * Builds a string message body from a form submission
 * @param array $form
 * @return string
 */
function template_form_message(array $form)
{
    return "You've received a new message.\n" .
        implode("\n", array_map(function ($key, $value) {
            return "$key: $value";
        }, array_filter($form, function ($key) {
            return $key !== '_next';
        }, ARRAY_FILTER_USE_KEY), array_filter($form, function ($key) {
            return $key !== '_next';
        }, ARRAY_FILTER_USE_KEY)));
}
