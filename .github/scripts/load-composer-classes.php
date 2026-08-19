<?php

declare(strict_types=1);

if ($argc !== 2) {
    fwrite(STDERR, "Usage: php load-composer-classes.php <template-directory>\n");
    exit(2);
}

$template = realpath($argv[1]);
if ($template === false || !is_file($template . '/vendor/autoload.php')) {
    fwrite(STDERR, "Installed template not found: {$argv[1]}\n");
    exit(2);
}

require $template . '/vendor/autoload.php';

function importedClasses(string $declaration): array
{
    $prefix = '';
    if (str_contains($declaration, '{')) {
        [$prefix, $declaration] = explode('{', $declaration, 2);
        $declaration = strstr($declaration, '}', true) ?: '';
    }

    $classes = [];
    foreach (explode(',', $declaration) as $import) {
        $import = trim($import);
        if ($import === '' || preg_match('/^(?:function|const)\s/i', $import)) {
            continue;
        }

        $class = preg_split('/\s+as\s+/i', $import)[0];
        $classes[] = trim($prefix) . $class;
    }

    return $classes;
}

$symbols = [];
foreach (glob($template . '/src/*.php') ?: [] as $source) {
    $contents = file_get_contents($source);
    if ($contents === false) {
        fwrite(STDERR, "Unable to read PHP source: {$source}\n");
        exit(2);
    }

    preg_match_all('/^\s*use\s+(?!function\s|const\s)([^;]+);/m', $contents, $matches);
    foreach ($matches[1] as $declaration) {
        array_push($symbols, ...importedClasses($declaration));
    }
}

// A PHP use declaration does not autoload its class. Load every imported symbol explicitly so
// dependency parse errors (including case-insensitive duplicate methods) fail during CI.
foreach (array_unique($symbols) as $symbol) {
    $loaded = class_exists($symbol)
        || interface_exists($symbol)
        || trait_exists($symbol)
        || (function_exists('enum_exists') && enum_exists($symbol));

    if (!$loaded) {
        fwrite(STDERR, "Unable to load imported symbol: {$symbol}\n");
        exit(1);
    }
}

$entrypoint = $template . '/src/index.php';
if (is_file($entrypoint) && !is_callable(require $entrypoint)) {
    fwrite(STDERR, "PHP entrypoint did not return a callable: {$entrypoint}\n");
    exit(1);
}
