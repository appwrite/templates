<?php

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
 * @throws Exception
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
        throw new Exception('Missing required fields: ' . implode(', ', $missing));
    }
}

/**
 * Interpolates values into a template string.
 * @param string $template The template string containing placeholders like "{{key}}".
 * @param array<string, string|null> $values An associative array with keys and values to replace in the template.
 * @return string The interpolated string with placeholders replaced by corresponding values.
 */
function interpolate(string $template, array $values): string
{
    return preg_replace_callback('/{{([^}]+)}}/', function ($matches) use ($values) {
        $key = $matches[1];
        return isset($values[$key]) ? $values[$key] : '';
    }, $template);
}