import 'dart:io';
import 'dart:async';
import 'package:dart_openai/dart_openai.dart';
import 'utils.dart';

Future<dynamic> main(final context) async {
  throwIfMissing(Platform.environment, ['OPENAI_API_KEY']);

  if (context.req.method == 'GET') {
    return context.res.text(getStaticFile('index.html'), 200,
        {'Content-Type': 'text/html; charset=utf-8'});
  }

  try {
    throwIfMissing(context.req.body, ['prompt']);
  } catch (err) {
    return context.res.json({'ok': false, 'error': err.toString()});
  }

  OpenAI.apiKey = Platform.environment['OPENAI_API_KEY']!;

  try {
    final response = await OpenAI.instance.chat.create(
      model: 'gpt-3.5-turbo',
      maxTokens: int.parse(Platform.environment['OPENAI_MAX_TOKENS'] ?? '512'),
      messages: [
        OpenAIChatCompletionChoiceMessageModel(
            content: context.req.body['prompt'],
            role: OpenAIChatMessageRole.user)
      ],
    );

    final completion = response.choices[0].message.content;

    return context.res.json({'ok': true, 'completion': completion}, 200);
  } on RequestFailedException {
    return context.res
        .json({'ok': false, 'error': 'Failed to query model.'}, 500);
  }
}
