import func from './src/main.js';

func({
  req: {
    method: 'POST',
    body: {
      prompt: 'Why do we use the brown fox example so much?',
      type: 'text',
    },
  },
  res: {
    json(data, status) {
      console.log(data);
    },
  },
  error: (err) => {
    console.error(err);
  },
});
