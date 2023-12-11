const fs = require("fs")
const path = require("path")

class MyFileReader {
  constructor() {
    // You can initialize any properties or configurations here
  }

  getAllFilePaths(folderPath) {
    const allFiles = this.readFilesRecursively(folderPath)
    return allFiles
  }

  readFilesRecursively(folderPath) {
    const files = fs.readdirSync(folderPath)

    const filePaths = files.map((file) => {
      const fullPath = path.join(folderPath, file)
      return fs.statSync(fullPath).isDirectory()
        ? this.readFilesRecursively(fullPath)
        : fullPath
    })

    return Array.prototype.concat(...filePaths)
  }
}

module.exports = MyFileReader
