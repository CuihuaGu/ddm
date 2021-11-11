import express from "express";
import { doMultiSearch } from "../jiaoyiyou.js";

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Hi there!!", items: [] });
});

router.post("/", async function (req, res, next) {
  const { search = "" } = req.body;
  const items = await doMultiSearch(search.split(" "));
  res.render("index", { title: "Buy!!", items: items });
});

export default router;
