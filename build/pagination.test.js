"use strict";
// Kiểm thử dãy số trang. Hàm thuần trong assets/js/dom.js, nạp qua node:vm
// như các test front-end khác.

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const sandbox = { document: { addEventListener() {} }, setTimeout, clearTimeout, console };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "..", "assets", "js", "dom.js"), "utf8"),
  sandbox, { filename: "dom.js" });
const { paginationRange } = vm.runInContext("({ paginationRange })", sandbox);

test("ít trang thì liệt kê hết, không rút gọn", () => {
  assert.deepEqual(paginationRange(1, 1), [1]);
  assert.deepEqual(paginationRange(3, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(paginationRange(4, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test("nhiều trang, đang ở đầu: rút gọn phía sau", () => {
  assert.deepEqual(paginationRange(1, 20), [1, 2, "...", 20]);
  assert.deepEqual(paginationRange(2, 20), [1, 2, 3, "...", 20]);
});

test("nhiều trang, đang ở giữa: rút gọn cả hai phía", () => {
  assert.deepEqual(paginationRange(10, 20), [1, "...", 9, 10, 11, "...", 20]);
});

test("nhiều trang, đang ở cuối: rút gọn phía trước", () => {
  assert.deepEqual(paginationRange(20, 20), [1, "...", 19, 20]);
  assert.deepEqual(paginationRange(19, 20), [1, "...", 18, 19, 20]);
});

test("luôn có trang đầu và trang cuối, không lặp số nào", () => {
  for (let total = 1; total <= 25; total++) {
    for (let cur = 1; cur <= total; cur++) {
      const r = paginationRange(cur, total);
      assert.equal(r[0], 1, `trang ${cur}/${total}: thiếu trang đầu`);
      assert.equal(r[r.length - 1], total, `trang ${cur}/${total}: thiếu trang cuối`);
      assert.ok(r.includes(cur), `trang ${cur}/${total}: thiếu chính trang hiện tại`);
      const nums = r.filter((x) => x !== "...");
      assert.equal(new Set(nums).size, nums.length, `trang ${cur}/${total}: có số lặp`);
      assert.deepEqual(nums, [...nums].sort((a, b) => a - b), `trang ${cur}/${total}: sai thứ tự`);
    }
  }
});
