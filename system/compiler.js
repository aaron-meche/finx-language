import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __sysDir = path.dirname(__filename);

//
// Read File Text Content
function readFileText(filePath) { 
    try {
        const content = fs.readFileSync(path.join(__sysDir, filePath), 'utf8');
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

//
// Minimize Size of Raw Content
function optimizeRawFile(rawContent) {
    let lineArray = rawContent.split("\n")
    let checkedLineArray = []
    //
    // Goes Through Every Line
    for (let i = 0; i < lineArray.length; i++) {
        let currLine = lineArray[i]
        let trimmedLine = currLine.trim()
        let charArray = trimmedLine.split("")
        let lastChar = charArray[charArray.length - 1]
        //
        // If Line is Not Empty, do Checks
        if (trimmedLine.length > 0) {
            //
            // Unfinished Array (Read Until Closed)
            if (lastChar == "[") {
                let fullLine = currLine
                for (let j = 1; (i + j) < lineArray.length; j++) {
                    let nextLine = lineArray[i + j].trim()
                    let nextLastChar = nextLine[nextLine.length - 1]
                    if (nextLastChar == "]") {
                        fullLine += nextLine
                        i += j
                        break;
                    }
                    else {
                        fullLine += `${nextLine}`
                    }
                    console.log(lastChar)
                }
                checkedLineArray.push(fullLine)
            }
            //
            // No Checks, Add to Checked Array
            else {
                checkedLineArray.push(currLine)
            }
        }
    }
    return checkedLineArray
}

//
// Main Compiler Class
class FinxLangFile {
    constructor(filePath) {
        let rawContent = readFileText(filePath)
        this.content = optimizeRawFile(rawContent)
    }

    printContent() {
        console.log("-- Program Content --")
        console.log(this.content)
    }

    buildCommand(cmd, inputs) {
        let line = [cmd, "::", inputs.join("||")].join("")
        return line
    }

    processLine(i) {
        let currLine = this.content[i]
        let nextLine = this.content[i + 1]
        let lineArray = currLine.split(" ")
        let firstKey = lineArray[0]

        if (firstKey == "prog") {
            let line = this.buildCommand("prog", [currLine.replace("prog ", ""), nextLine.trim()])
            this.instructions.push(line)
        }
        else if (firstKey == "def") {
            let line = this.buildCommand("def", [lineArray[1], currLine.split("=")[1].trim()])
            this.instructions.push(line)
        }
        else if (firstKey == "func") {
            let line = this.buildCommand("func", [lineArray[1].split("\(")[0]])
            console.log(funcName)
        }
    }

    compile() {
        this.instructions = []
        for (let i = 0; i < this.content.length; i++) {
            this.processLine(i)
        }
        console.log(this.instructions)
        fs.writeFileSync(path.join(__sysDir, "output.finx"), this.instructions.join("\n"))
    }

}

//
// Main Access Function
// -- Program Interface --
// .. Take in Request
// .. Process and Fetch File
// .. Send Content to Compiler
function main() {
    const program = new FinxLangFile("./dev.finx");
    // program.printContent()
    program.compile()
}

main()