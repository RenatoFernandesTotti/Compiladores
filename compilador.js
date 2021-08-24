const fs = require("fs");

function tokenizacao() {
  try {
    const reservedWords = ["if", "for", "in", "while"];
    const operators = ["=", "==", "<", ">", ">=", "<=", "+", "+=", "and", "or"];
    const delimiters = [":"];
    const separators = [","];
    const sourceCode = fs
      .readFileSync("./arquivo_python.py", {
        encoding: "utf-8",
      })
      .toString()
      .split("\n");

    let buffer = "";
    let tabChecker = 0;
    let arrayChecker = 0;
    let funcChecker = 0;
    let parenthesesCheck = 0;
    let shouldCloseFunc = [];
    sourceCode.forEach((line, lineNumber) => {
      let arrayErrorIndex = 0;
      const breakedLine = line.split(" ");
      breakedLine.forEach((column, columnNumber) => {
        switch (true) {
          case reservedWords.includes(column):
            buffer += "<KW>";
            break;

          case operators.includes(column):
            buffer += "<OP>";
            break;

          case separators.includes(column):
            buffer += "<SEP>";
            break;

          case delimiters.includes(column):
            buffer += "<DLMTR>";
            break;

          case !isNaN(column) && column !== "":
            buffer += "<NUM>";
            break;

          case (column.match(/'|"/gi) || []).length > 0:
            if (column.match(/'|"/gi || []).length === 1) {
              throw new Error(
                `Expected ' at line ${lineNumber + 1} token ${columnNumber + 1}`
              );
            }
            buffer += "<STR>";
            break;

          case column === "(":
            buffer += "<(>";
            parenthesesCheck++;
            shouldCloseFunc.push(false);
            arrayErrorIndex = columnNumber;
            break;

          case (column.match(/\(/gi) || []).length > 0:
            buffer += "<FUNC><FUNCINIT>";
            funcChecker++;
            shouldCloseFunc.push(true);
            arrayErrorIndex = columnNumber;
            break;

          case column === ")":
            if (shouldCloseFunc.shift()) {
              buffer += "<FUNCEND>";
              funcChecker--;
            } else {
              buffer += "<)>";
              parenthesesCheck--;
            }
            arrayErrorIndex = columnNumber;
            break;

          case column === "":
            if (tabChecker === 3) {
              buffer += "<TAB>";
              tabChecker = 0;
              return;
            }
            tabChecker++;
            break;

          case column === "[":
            buffer += "<ARRINIT>";
            arrayChecker++;
            arrayErrorIndex = columnNumber;
            break;

          case column === "]":
            buffer += "<ARREND>";
            arrayChecker--;
            arrayErrorIndex = columnNumber;
            break;

          default:
            buffer += "<ID>";

            break;
        }
      });

      if (arrayChecker !== 0) {
        throw new Error(
          `Error in array at line ${lineNumber + 1} token ${
            arrayErrorIndex + 1
          }`
        );
      }

      if (funcChecker !== 0) {
        throw new Error(`Error in function at line ${lineNumber + 1} `);
      }

      if (parenthesesCheck !== 0) {
        throw new Error(`Expected parentheses at line ${lineNumber + 1} `);
      }
      buffer += "\n";
    });

    buffer = buffer.replace(/(\n){2,}/gi, "\n");

    fs.writeFileSync("./buffers/token.txt", buffer);
  } catch (error) {
    console.log(error);
  }
}

tokenizacao();
