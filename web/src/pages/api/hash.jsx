import hash from "simple-sha256";

export default async function hashApi(req, res) {
  const { value } = JSON.parse(req.body);
  const hashed = await hash(value);
  res.json(hashed);
}
