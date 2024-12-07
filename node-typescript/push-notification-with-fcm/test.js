import main from './src/main.js';

main({
  req: {
    bodyJson: {
      deviceToken: 'deviceToken',
      message: {
        title: 'title',
        body: 'body',
      },
      data: {
        key: 'value',
      },
    },
  },
  res: {
    json: (data, status) => {
      console.log(data, status);
    },
  },
  log: console.log,
  error: console.error,
})