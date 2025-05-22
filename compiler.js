import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { inflate } from 'zlib';

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
        return ""
    }
}
//
// Write File Text Content
function writeFileText(filePath, fileContent) {
    fs.writeFileSync(path.join(__sysDir, filePath), fileContent)
}

//
// Minimize Size of Raw Content
function optimizeFinxFile(rawContent) {
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

class FinxRuntime {
    constructor(instructions) {
        this.startRuntime(instructions)
        console.log("Program Running...")
        for (let i = 0; i < this.instructions.length; i++) {
            let splitKeys = this.instructions[i].split("|")
            let inst = splitKeys[1]

            if (inst == "import") {
                this.handleImport(splitKeys[2])
            } else if (inst == "def") {
                this.handleDefiniton(splitKeys[2], splitKeys[3], splitKeys[4])
            } else if (inst == "func") {
                this.handleFunction(splitKeys[2], splitKeys[3])
            }
        }
        console.log(this.functions)
    }
    startRuntime(instructions) {
        this.instructions = instructions
        this.memory = []
        this.imports = []
        this.variables = []
        this.functions = []
    }
    handleImport(name) {
        this.imports.push(name)
    }
    handleDefiniton(name, type, val) {
        this.variables.push([name, type, val])
    }
    handleFunction(name, params) {
        this.functions.push({
            name: name, 
            params: params,
            body: []
        })
    }
    handleAction(act) {

    }
    
}

//
// Main Compiler Class
class FinxLangFile {
    constructor(filePath) {
        let rawContent = readFileText(filePath)
        this.content = rawContent.split("\n")
        // this.content = optimizeFinxFile(rawContent)
        this.altitudeMap = []
    }

    printContent() {
        // console.log(this)
    }

    parseLine(i) {
        let currLine = this.content[i]
        let nextLine = this.content[i + 1]
        let currTrimLine = currLine.trim()
        let currLineLength = currLine.trim().length
        let lineArray = currTrimLine.split(" ")
        let lineAlt = currLine.match(/^ */)[0].length
        let keyword = currTrimLine.split(" ")[0]
        let funcNameTree = [""]
        let keywordTree = {
            "import": () => {
                this.instructions.push(`import|${lineArray[1]}`)
            },
            "def": () => {
                let varName = lineArray[1]?.replace(":", "")
                let varValue = currTrimLine.substring(currTrimLine.indexOf("=") + 1).trim()
                this.instructions.push(`def|${varName}|${lineArray[2]}|${varValue}`)
            },
            "class": () => {
                this.activeClass = true
                let className = lineArray[1]
                this.instructions.push(`class|${className}|{`)
            },
            "func": () => {
                let funcName = currTrimLine.substring(currTrimLine.indexOf(" ") + 1).split("(")[0]
                let funcParam = currTrimLine.substring(currTrimLine.indexOf("(") + 1).split(")")[0]
                funcNameTree.push(funcName)
                this.instructions.push(`func|${funcName}|(${funcParam})|{`)
            },
            "act": () => {
                let actCall = currTrimLine.substring(currTrimLine.indexOf(" ") + 1);
                this.instructions.push(`>|${actCall}`)
            },
            "each": () => {
                this.instructions.push(`each|${lineArray[1]}|${lineArray[3]}|{`)
            },
            "}": () => {
                this.instructions.push(`>|${currTrimLine}`)
            },
            "]": () => {
                this.instructions.push(`>|${currTrimLine.replace(",", "")}`)
            },
            "//": () => {
                this.instructions.push(`//|${currLine.substring(currLine.indexOf(" ") + 1)}`)
            }
        }

        this.altitudeMap.push(lineAlt)

        if (Object.keys(keywordTree).includes(keyword)) {
            keywordTree[keyword]()
        } else {
            this.instructions.push(`>|${currTrimLine}`)
        }
    }

    parse(outputPath) {
        this.instructions = []
        for (let i = 0; i < this.content.length; i++) {
            this.parseLine(i)
            this.instructions[i] = `${this.altitudeMap[i]}|${this.instructions[i]}`
        }
        if (outputPath) writeFileText(outputPath, this.instructions.join("\n"))
        return this.instructions.join("\n")
    }

    compileLine(i) {
        let currLine = this.instructions[i]
        let keys = currLine.split("|")
        let appendJS = (code) => {
            this.javascript.push(" ".repeat(keys[0]) + code)
        }
        let instructionTree = {
            "import": () => {
                let importFile = new FinxLangFile(`./finxp/${keys[2]}.finxp`)
                importFile.parse()
                let compiled = importFile.compile()
                appendJS(compiled)
            },
            "def": () => {
                // If No Type
                if (keys[3] == "=") {
                    appendJS(`let ${keys[2]} = ${keys[4]}`)
                } 
                // If Type
                else {
                    // If Open Object
                    if (keys[4] == "{") {
                        appendJS(`let ${keys[2]} = new ${keys[3]}({`)
                        this.closeOpenCall(i, keys, ")")
                    } 
                    else if (keys[4] == "[") {
                        appendJS(`let ${keys[2]} = new ${keys[3]}([`)
                        this.closeOpenCall(i, keys, ")")
                    }
                    // If Inline Value
                    else {
                        appendJS(`let ${keys[2]} = new ${keys[3]}(${keys[4]})`)
                    }
                }
            },
            "class": () => {
                appendJS(`class ${keys[2]} {`)
            },
            "func": () => {
                appendJS(`function ${keys[2]}${keys[3]} {`)
            },
            ">": () => {
                appendJS(`${keys[2]}`)
            },
            "each": () => {
                appendJS(`for (let i = 0; i < ${keys[2]}.length; i++) { let ${keys[3]} = ${keys[2]}[i];`)
            },
            "}": () => {
                appendJS("}")
            },
            "//": () => {
                appendJS(`// ${keys[2]}`)
            },
        }

        if (Object.keys(instructionTree).includes(keys[1])) {
            instructionTree[keys[1]]()
        } else {
            this.javascript.push(keys.join(""))
        }
    }

    compile(outputPath) {
        this.javascript = []
        for (let i = 0; i < this.instructions.length; i++) {
            this.compileLine(i)
        }
        if (outputPath) writeFileText(outputPath, this.javascript.join("\n"))
        return this.javascript.join("\n")
    }

    closeOpenCall(i, keys, char) {
        let startAlt = keys[0]
        for (let t = i + 1; t < this.instructions.length; t++) {
            let nextLine = this.instructions[t]
            if (nextLine.split("|")[0] == startAlt) {
                this.instructions[t] += char
                return
            }
        }
    }

    run() {
        this.runtime = new FinxRuntime(this.instructions)
    }

}

//
// Main Access Function
// -- Program Interface --
// .. Take in Request
// .. Process and Fetch File
// .. Send Content to Compiler
function main() {
    const program = new FinxLangFile("input/main.finx");
    program.parse("output/out.finx")
    program.compile("output/out.js")
}

main()