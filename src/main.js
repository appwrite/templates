export default async ({ req, res }) => {
  const { phone } = JSON.parse(req.body);
  const token = "abc123";
  return res.json({ token: token });
};
