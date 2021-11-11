import axios from "axios";
import lodash from "lodash";
import { getAllIndexes } from "./utils.js";

export async function doMultiSearch(keys) {
  let results = [];
  const seen = [];
  for (const key of keys) {
    const res = await doSearch(key);
    seen.push(res.map((o) => o.goodsSn));
    results = [...results, ...res];
  }

  const ids = lodash.intersection(...seen);
  return ids
    .map((id) => {
      return results.find((o) => o.goodsSn === id);
    })
    .map((o) => ({
      ...o,
      url: "https://www.jiaoyiyou.com/detail/" + o.goodsSn,
    }));
}

async function doSearch(key) {
  const items = await axios.get(
    encodeURI(
      `https://www.jiaoyiyou.com/wares/?pageSize=12&pages=1&gid=41&gt=1&keyWord=${key}`
    )
  );
  const { data } = items;

  const endPage = data
    .split('<input type="number" autocomplete="off" min="1" max="')[1]
    .split('"')[0];

  const results = [];
  for (let i = 0; i < endPage; i++) {
    const result = await getAll(i + 1, key);
    results.push(result);
  }

  return lodash.flatten(results);
}

async function getAll(page, key) {
  const items = await axios.get(
    encodeURI(
      `https://www.jiaoyiyou.com/wares/?pageSize=12&pages=${page}&gid=41&gt=1&keyWord=${key}`
    )
  );
  const { data } = items;
  return parseBody(data);
}

function parseBody(data) {
  const left = getAllIndexes(data, "<script");
  const right = getAllIndexes(data, "</script>");

  const target = data.indexOf("<script>");

  const i = left.findIndex((o) => o === target);

  const str = data.slice(left[i] + 8, right[i]).replaceAll("\n", "");
  const start = str.indexOf("statTrafScript");
  const end = str.indexOf("homePopUpAds");
  const str2 = str.slice(0, start) + str.slice(end, -1);

  const window = {};
  eval(str2);
  return window.__NUXT__.data[0].goodsListData.goodsList;
}
