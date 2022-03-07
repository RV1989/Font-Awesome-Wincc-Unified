const fs = require( 'fs' );
const path = require( 'path' );

const pathOriginals = path.join(__dirname,"./node_modules/@fortawesome/fontawesome-free/svgs/")
const pathSvgHmi = path.join(__dirname ,"./svghmi/fontawesome-free/")


const readFilesInDir = async (from , to)=>{
 
        // Get the files as an array
        const files = await fs.promises.readdir( from ).catch(e => console.error(e));
        // Loop them all with the new for...of
        for( const file of files ) {
            // Get the full paths
            const fromPath = path.join( from, file );
            const toPath = path.join(to, file );
            // Stat the file to see if we have a file or dir
            const stat = await fs.promises.stat( fromPath );
            if( stat.isFile() ){
                await svgToSvghmi( fromPath, toPath.replace(file,'') ).catch(e=>console.error(e))
                console.log( `Converted ${fromPath.replace(pathOriginals,'')}->${toPath.replace(pathSvgHmi,'')+'hmi'}` );
            }
            else if( stat.isDirectory() ){
     
                console.log(`directory added ${fromPath.replace(pathOriginals,'')}` );
                readFilesInDir(fromPath, toPath)
          
            }
              
        } 
    



}


const svgToSvghmi= async(file,savePath)=>{
    const fileName = `${path.basename(file)}hmi`
    const iconName = fileName.replace('.svghmi','')+'_'+savePath.replace(pathSvgHmi,'').replace('/','')
    let content = await fs.promises.readFile(file,'utf-8')
        const regexViewBox = /viewBox="(.*?)"/
        let viewBox = regexViewBox.exec(content)[0]
        const regexHeader = /<svg(.*?)>/
        const changeHeaderTo = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:hmi-bind--xlink="http://svg.siemens.com/hmi/bind/xlink/" xmlns:hmi="http://svg.siemens.com/hmi/" xmlns:hmi-bind="http://svg.siemens.com/hmi/bind/" xmlns:hmi-element="http://svg.siemens.com/hmi/element/" xmlns:hmi-feature="http://svg.siemens.com/hmi/feature/" xmlns:hmi-event="http://svg.siemens.com/hmi/event/" ${viewBox}>`
        const regexInjectHmi = /><path/
        const injectHmi = `><hmi:self type="widget" displayName="${iconName}" name="extended.${iconName}" version="1.0.1" performanceClass="L"><hmi:paramDef name="color" type="HmiColor" default="0xff000000" /></hmi:self><defs><hmi:localDef name="Color" type="HmiColor" hmi-bind:value="{{ParamProps.color}}" /></defs><path`
        const regexBindColor = /\/><\/svg>/g
        const bindColor = ` hmi-bind:fill="{{Converter.RGBA(ParamProps.color)}}" /></svg>`
        

        content =content.replace(regexHeader,changeHeaderTo)
        content=content.replace(regexInjectHmi,injectHmi)
        content =content.replace(regexBindColor,bindColor)
        return fs.promises.writeFile(path.join(savePath,fileName),content)
}

//svgToSvghmi(path.join('./svghmi/brands/yarn.svg') ,path.join('./svghmi/brands/') 

readFilesInDir(pathOriginals,pathSvgHmi)