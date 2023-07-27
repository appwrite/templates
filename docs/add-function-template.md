# Creating a new function template

This document is part of the Appwrite contributors' guide. Before you continue reading this document make sure you have read the [Code of Conduct](https://github.com/appwrite/templates/blob/main/CONTRIBUTING.md) and the [Contributing Guide](https://github.com/appwrite/templates/blob/main/CONTRIBUTING.md).

## 1. Getting started

It's really easy to contribute to an open-source project, but when using GitHub, there are a few steps we need to follow. This section will take you step-by-step through the process of preparing your local version of Appwrite, where you can make any changes without affecting Appwrite right away.

> If you are experienced with GitHub or have made a pull request before, you can skip to [Implement new runtime](https://github.com/appwrite/templates/blob/main/docs/add-function-template.md#2-implement-new-runtime).

### 1.1 Fork the repository

Before making any changes, you will need to fork the Templates repository. To do that, visit [the repository github page](https://github.com/appwrite/templates) and click on the fork button.


This will redirect you from `github.com/appwrite/templates` to `github.com/YOUR_USERNAME/templates`, meaning all changes you do are only done inside your repository. Once you are there, click the highlighted `Code` button, copy the URL and clone the repository to your computer using the `git clone` command:

```bash
$ git clone COPIED_URL
```

> To fork a repository, you will need a basic understanding of CLI and git-cli binaries installed. If you are a beginner, we recommend you to use `Github Desktop`. It is a clean and simple visual Git client.

Finally, you will need to create a `feat-XXX-YYY-template` branch based on the `main` branch and switch to it. The `XXX` should represent the issue ID and `YYY` the template name.

## 2. Implementing new templates

If you're looking to port an existing template to a new runtime, please skip to [Adding a new runtime for an existing template](https://github.com/appwrite/templates/blob/main/docs/add-function-template.md#21-adding-a-new-runtime-for-an-existing-template).

If you want to contribute a new template, that doesn't have any existing templates, please skip to [Adding brand new templates](https://github.com/appwrite/templates/blob/main/docs/add-function-template.md#22-adding-brand-new-templates).

### 2.1. Adding a new runtime for an existing template


### 2.2. Adding brand new templates
