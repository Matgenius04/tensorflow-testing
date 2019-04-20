let stocks = [];
let urls = ["https://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nasdaq&render=download","https://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nyse&render=download","https://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=amex&render=download"];
let p = 0; // how many links processed
let t0 = performance.now();
let NasdaqHatesMe = [];
let iter = 0;
let getAll = async (url) => {
    let output = [];
    await fetch(`https://proxy--zibri.repl.co/${url.replace(/\/\//g, '/')}`,{cors:'*'})
        .then(async (response) => {
            let buffer = (await response.arrayBuffer());
            if (buffer == undefined || null){
                throw console.error("The Url Is incorrect");
            }
            let array = Array.from(new Uint8Array(buffer));
            await array.forEach((v, i) => {
                array[i] = String.fromCharCode(v);
            })
            let stringArray = [];
            let start = false;
            let thisString = "";
            array.forEach((v,i) => {
                if (start == true) {
                    thisString = thisString.concat(v);
                } else {
                    if (thisString !== "") {
                        stringArray.push(thisString);
                        thisString = ""
                    } else {
                        thisString = ""
                    }
                };
                if (v == "\"") {
                    start = !start;
                }
            })
            let thisRow = {};
            await stringArray.forEach((v, i) => { // for every string in the array, organize it into symbol,name,lastsale,marketcap,ipoyear,sector,industry, and summaryquote
                let it = (i>=8) ? i-(Math.floor(i/8)*8): i;
                switch (it % 8) {
                    case 0:
                        thisRow.symbol = v.replace("\"","")
                        break;
                    case 1:
                        thisRow.name = v.replace("\"","")
                        break;
                    case 2:
                        thisRow.lastsale = v.replace("\"","")
                        break;
                    case 3:
                        thisRow.marketcap = v.replace("\"","")
                        break;
                    case 4:
                        thisRow.ipoyear = v.replace("\"","")
                        break;
                    case 5:
                        thisRow.sector = v.replace("\"","")
                        break;
                    case 6:
                        thisRow.industry = v.replace("\"","")
                        break;
                    case 7:
                        thisRow.summaryquote = v.replace("\"","")
                        output.push(thisRow);
                        thisRow = {};
                        break;
                }
            })
            output.shift(); // get rid of the labels that are automatically downloaded
            (stocks) ? stocks = stocks.concat(output) : stocks = output; // concatenate all the outputs together
            p++;
            // if 3 links all done processing
            if (p == urls.length) {
                getMore();
                    let t1 = performance.now();
                    console.log(t1-t0);
            }
        });
} 
function getMore() {
    for (let i=0;i<stocks.length;i++) {
        getMoreInfo(stocks[i].symbol,i);
    }
}
async function getMoreInfo(symbol,i) {
    fetch(`http://proxy--zibri.repl.co/https:/www.nasdaq.com/symbol/${symbol}/historical`,{cors:"*"}).then(async (res)=>{
        let parser = new DOMParser();
        let array = new Uint8Array(await res.arrayBuffer());
        let htmlArr = [];
        array.forEach((v,i)=>{
            htmlArr.push(String.fromCharCode(v));
        })
        let string = htmlArr.join("");
        let doc = parser.parseFromString(string, "text/html");
        let data = [];
        
        try {
            for(let j=0;j<doc.querySelectorAll('table')[2].children[1].children.length;j++){
                let dataArr = [];
                for (k=0;k<doc.querySelectorAll('table')[2].children[1].children[j].children.length;k++) {
                    dataArr.push(doc.querySelectorAll('table')[2].children[1].children[j].children[k].innerText.replace(/ /g,'').replace(/\n/g,''));
                }
            data.push(dataArr);
            }
        } catch {
            console.log(doc.querySelectorAll('table'));
            console.log(i);
            NasdaqHatesMe.push(i);
        }
        data.shift();
        stocks[i].historical = await data;
        iter = i;
    });
}

for (let i=0;i<urls.length;i++) {
    getAll(urls[i]);
}