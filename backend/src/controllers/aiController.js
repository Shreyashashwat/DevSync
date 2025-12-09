import axios from "axios";

export const aiCategoryPriority = async (req, res) => {
  const { description } = req.body;

  const response = await axios.post(
    "http://ai-category:7001/api/ai/classify",
    { text: description }
  );

  res.json(response.data);
};
