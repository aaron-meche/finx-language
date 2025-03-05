


// System Runtime Helper Classes

// def ChaseCSV: String = ""
// ChaseCSV = ChaseCSV + @'./Sapphire.csv'
// ChaseCSV = ChaseCSV + @'./FreedomUnlimited.csv'
// ChaseCSV = ChaseCSV + @'./FreedomFlex.csv'
// def ChaseTable: Table = new Table(ChaseCSV)

// def.new("ChaseCSV", "String", "")
// def.edit("ChaseCSV", var.read("ChaseCSV") + file.read('./Sapphire.csv'))
// def.edit("ChaseCSV", var.read("ChaseCSV") + file.read('./FreedomUnlimited.csv'))
// def.edit("ChaseCSV", var.read("ChaseCSV") + file.read('./FreedomFlex.csv'))
// def.define("ChaseTable", "Table", new Table(var.read("ChaseCSV")))

const def = {
    store: {},
    new: (ref, type, value) => {
        def.store[ref] = {
            type: type,
            value: value
        }
    },
    edit: (ref, value) => {
        def.store[ref] = value
    },
    read: (ref) => {
        return def.store[ref]
    }
}