import axios from "axios";

export const askChatbot = async (req, res) => {
  const { question } = req.body;
  const { tenantId, role, id } = req.user;

  const response = await axios.get("http://ragbot:8000/ask", {
    params: {
      q: question,
      tenant_id:tenantId,
      role,
      user_id: role === "admin" ? null : id,
    },
  });

  res.json({ answer: response.data.answer });
};

