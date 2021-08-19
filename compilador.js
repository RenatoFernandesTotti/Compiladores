const fs = require("fs");

function analiseLexica() {
  try {
    const reservedWords = ["if", "for"];
    const operators = ["=", "==", "<", ">", ">=", "<=", "+"];
    const delimiters = [":"];
    const sourceCode = fs
      .readFileSync("./arquivo_python.py", {
        encoding: "utf-8",
      })
      .toString()
      .split("\n")
      .filter((line) => line);

    let buffer = "";
    let validTab = false;
    let tabChecker = 0;
    sourceCode.forEach((line, lineNumber) => {
      const breakedLine = line.split(" ");
      breakedLine.forEach((column, columnNumber) => {
        switch (true) {
          case reservedWords.includes(column):
            buffer += "<KW>";
            break;
          case operators.includes(column):
            buffer += "<OP>";
            break;
          case delimiters.includes(column):
            buffer += "<DLMTR>";
            break;
          case !isNaN(column):
            buffer += "<NUM>";
            break;
          case column === " ":

          default:
            if (column.startsWith("'")) {
              if (column.endsWith("'")) {
                buffer += "<STR>";
                return;
              } else {
                throw new Error(
                  `Expected ' at line ${lineNumber + 1} token ${
                    columnNumber + 1
                  }`
                );
              }
            }
            buffer += "<ID>";
            break;
        }
      });
      buffer += "\n";
    });

    fs.writeFileSync("./buffers/token.txt", buffer);
  } catch (error) {
    console.log(error);
  }
}

analiseLexica();
