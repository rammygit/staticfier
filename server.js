// const md = require('')
const marked = require('marked');

const fsPromises = require('fs').promises;

const path = require('path')

const cheerio = require('cheerio')

const DIRECTORY_IGNORE = ['node_modules','.git']

const FILE_IGNORE = ['.gitignore','server.js','server_new.js','package-lock.json','package.json']

const PROJECT_PATH = '/Users/ram/Documents/projects/html5-boilerplate_v7.2.0/' 










// Set options
// `highlight` example uses `highlight.js`
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code) {
      return require('highlight.js').highlightAuto(code).value;
    },
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    xhtml: false
  });


  const readDirectory = async function (basePath) {

    let appendHTMLs = []
    console.log('printing the base path at the start => ',basePath)

    

    const dirArr = await fsPromises.readdir(basePath, { withFileTypes: true })

    // console.log('dirArr => ',dirArr)
    for (const dirent of dirArr) {

        const file_ext = path.extname(dirent.name)
        const stat = await fsPromises.lstat(basePath+dirent.name);

        // console.log(" file list   => ", dirent)
        //  console.log('dirent stat =  is file  =>', stat.isFile())
        if (stat.isFile()) {
            console.log(' it is a file => ', dirent.name)
            if (file_ext === '.html' || file_ext === '.js' || file_ext === '.css' || file_ext === '.md') {
                if(FILE_IGNORE.indexOf (dirent.name ) == -1) {
                    console.log('reading the file => ',dirent.name)
                    let appendHTML = await process(basePath, dirent)
                    appendHTMLs.push(appendHTML)
                } else {
                    // console.log('ignore else => ',dirent.name)
                }
                
            } else {
                //  console.log('in the else part of not matching file extension ')
                // console.log('not processing this file  => ', dirent)
            }

        } else {
            // console.log('reading the child directory => ', basePath + dirent.name + '/')
            if(DIRECTORY_IGNORE.indexOf (dirent.name ) == -1) {
                console.log('reading the directory => ',dirent.name)
                readDirectory(basePath + dirent.name + '/')
            }
        }
    } // end of for

    return appendHTMLs
}

/**
 * process the file content and create a directory and create a index.html
 * @param {*} basePath 
 * @param {*} dirent 
 */
const process = async function (basePath, dirent) {

    //read the md 
    const fileContent = await fsPromises.readFile(basePath+dirent.name,{encoding:'utf-8'}).catch(() =>{
        console.error('error in reading file content')
    })

    // jus get the filename without the extension. need to find a better way to do this. 
    const fileName = dirent.name.substring(0,dirent.name.length -3)

    console.log(`filename => ${fileName}`)

    //Calling fsPromises.mkdir() when path is a directory 
    //that exists results in a rejection only when recursive is false.
    // remove the file extension. 
    await fsPromises.mkdir(basePath+fileName).catch(console.error);

    const htmlFile = marked(fileContent)

    // create an index.html for every md file. with the filename as folder and index.html inside it.
    fsPromises.writeFile(`${basePath}${fileName}/index.html`,htmlFile,{flag:'w'}).catch(console.error);

    // modify_indexpage('/md/'+fileName+'/index.html',fileName)

    // $(`<a href="/md/${fileName}/index.html">${fileName}</a>`).appendTo('#content')

    return `<a href="/md/${fileName}/index.html">${fileName}</a>`
}




//start here 
const start = async function () {
    
    const mainIndexFileContent = await fsPromises.readFile(PROJECT_PATH+'index.html',{encoding:'utf-8'}).catch(() =>{
        console.error('error in reading file content')
    })

    //load the main index file for manipulation. 
    const $= cheerio.load(mainIndexFileContent)

    // $ = await loadIndexHTML();

    let htmls = await readDirectory(PROJECT_PATH+'md/')

    console.log(`htmls ${htmls}`)

    htmls.forEach((html)=>$(html).appendTo('#content'));

    

    // console.log($.html())

    fsPromises.writeFile(`${PROJECT_PATH}index.html`,$.html(),{flag:'w'}).catch(console.error);

}

start()


 
 
    