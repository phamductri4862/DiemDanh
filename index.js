const open = require("open");
const fs = require("fs");
const chalk = require("chalk");
const puppeteer = require("puppeteer");
const path = require("path");

//Path log
const logPath = path.join(__dirname, "report.txt");

//CMD COLOR
const error = chalk.red;
const warning = chalk.keyword("orange");
const okay = chalk.green;

//Initialize list of students
let mahs = [];
const absent = [];
const check = new Array(48).fill(true);
for (let i = 0; i <= 46; i) {
  mahs[i] = String(++i).padStart(2, "0");
}
absent.forEach(function (x) {
  check[x] = false;
});

//Initialize dates
const now = new Date();
const d = new Date("12/27/2021");
const diffTime = Math.abs(now - d);
const diffWeeks = Math.floor(Math.floor(diffTime / (1000 * 60 * 60 * 24)) / 7);
const tuan = 16 + diffWeeks;
const mileStones = [15.75, 15, 13.75, 13, 10.25, 9.5, 8.5, 7.75, 7];
const time = now.getHours() + now.getMinutes() / 60;
let tiet;
for (let i = 0; i < mileStones.length; i++) {
  if (time >= mileStones[i]) {
    tiet = 8 - i;
    break;
  }
}

//Schedule
const subj = [
  [],
  ["Chào cờ", "Sinh hoạt CN", "Hóa học", "Vật lý", "Vật lý"],
  ["Toán", "Toán", "Vật lý", "Địa lý", "Hóa học", "", "", "", "GDQP"],
  ["GDCD", "Sinh học", "Toán", "Ngữ văn", "Ngữ văn"],
  [
    "Tin học",
    "Tin học",
    "Toán",
    "Toán",
    "Lịch sử",
    "Thể dục",
    "Thể dục",
    "",
    "",
  ],
  [
    "Hóa học",
    "Ngoại ngữ",
    "Ngoại ngữ",
    "Công nghệ",
    "Ngữ văn",
    "Nghề PT",
    "Nghề PT",
    "Nghề PT",
  ],
  ["Ngoại ngữ", "Ngoại ngữ", "Ngữ văn"],
];

const appFile = (str) => {
  fs.appendFile(logPath, str, "utf-8", function (err) {
    if (err) {
      console.log(err);
    }
  });
};

const url =
  "https://c3longthanh.edu.vn/xacnhandiemdanh.php?lop=11A1&mon=" +
  encodeURIComponent(subj[now.getDay()][tiet]) +
  "&mahs=202001";
let temp = `Tiết: ${tiet + 1} || ${new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
}).format(now)} || ${new Intl.DateTimeFormat("vi-VN", {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
}).format(now)} || ${now.toLocaleDateString("vi-VN")}`;
console.log(chalk.underline(temp));
console.log(`HS VANG: ${absent}`);
appFile(`${temp}\n`);
appFile(`HS VANG: ${absent}\n`);

//DD
(async () => {
  let success = false;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  for (let i = 0; i < mahs.length; i++) {
    if (check[parseInt(mahs[i])]) {
      const link = url + mahs[i];
      await page.goto(link);
      let data = await page.evaluate(() => {
        return document.querySelector("body").innerText;
      });
      console.log(`\n${link}`);
      console.log(chalk.bold(`${i + 1}. MAHS: ${mahs[i]}`));

      //CHECK
      switch (data[17]) {
        case "R":
          console.log(warning(data));
          break;
        case "T":
          console.log(okay(data));
          break;
        default:
          success = true;
          console.log(error(data));
      }
      appFile(`${i + 1}. MAHS: ${mahs[i]}\n${data}\n`);
    } else {
      console.log(chalk.bold(`\n${i + 1}. MAHS: ${mahs[i]}`));
      console.log(chalk.cyan("HS VANG"));
    }
  }
  await browser.close();
  appFile(
    "=======================================================================================================================\n"
  );

  if (!success) {
    console.log(
      chalk.bgGreen(
        `ĐIỂM DANH THÀNH CÔNG TIẾT ${tiet + 1} - ${subj[now.getDay()][tiet]}`
      )
    );
    open(
      `https://c3longthanh.edu.vn/danhsachvang.php?tuan=${tuan}&lop=11A1&ngay=${now.getFullYear()}-${
        now.getMonth() + 1
      }-${now.getDate()}&thu=${now.getDay() + 1}`
    );
    open(
      `https://c3longthanh.edu.vn/chitietdiemdanh.php?tuan=${tuan}&lop=11A1`
    );
  } else {
    console.log(chalk.bgRed(`ĐIỂM DANH KHÔNG THÀNH CÔNG`));
  }
  setTimeout(function () {}, 60000);
})();
