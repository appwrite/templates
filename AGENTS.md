# Repository instructions

When adding or updating template dependencies, use constraints that allow compatible patch and minor updates while excluding the next breaking version. Prefer caret ranges where the package manager supports them, avoid unbounded or wildcard constraints, and keep committed lockfiles in sync with their manifests.
