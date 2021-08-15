document.addEventListener('DOMContentLoaded', function () {
    // console.log(window.location)
    // con()
    const host = window.location.host
    if (host.indexOf('usenix') > -1) {
        usenix()
    }
    if (host.indexOf('acm.org') > -1) {
        acm()
    }
    if (host.indexOf('arxiv.org') > -1) {
        arxiv()
    }
    if (host.indexOf('neurips') > -1) {
        neurips()
    }
});

function usenix() {
    let bib = document.getElementsByClassName("bibtex-text-entry bibtex-accordion-text-entry")[0].innerHTML;
    let rawStr = bib
    /**
     * remove redundant info 
     */
    rawStr = rawStr.split('<br>').join("")
    const removeArr = ['isbn', 'url']
    for (let i of removeArr) {
        let startIdx = rawStr.indexOf(i)
        let endIdx = rawStr.indexOf(',', startIdx)
        rawStr = rawStr.replace(rawStr.substring(startIdx, endIdx + 3), '')
    }
    /**
     * identify YEAR & FLAG
     */
    let yearIdx = rawStr.indexOf('year')
    const YEAR = rawStr.substring(yearIdx + 10, yearIdx + 12);
    const usenixFlagMap = {
        '{OSDI}': 'OSDI',
        '{NSDI}': 'NSDI',
        '{USENIX} {ATC}': 'ATC'
    }
    let FLAG
    for (let i in usenixFlagMap) {
        if (rawStr.indexOf(i) > -1) {
            FLAG = usenixFlagMap[i]
        }
    }
    let titleReplaceFlag, seriesReplaceItem
    if (FLAG === 'OSDI' || FLAG === 'NSDI') {
        titleReplaceFlag = ` ({${FLAG}} ${YEAR})`
        seriesReplaceItem = `series = {${FLAG} '${YEAR}},`
    } else {
        titleReplaceFlag = ` ({USENIX} {${FLAG}} ${YEAR})`
        seriesReplaceItem = `series = {{USENIX} {${FLAG}} '${YEAR}},`
    }
    const replaceFlagArr = ['month', titleReplaceFlag]
    const replaceItemArr = [seriesReplaceItem, '},']
    for (let i = 0; i < 2; i++) {
        let startIdx = rawStr.indexOf(replaceFlagArr[i])
        let endIdx = rawStr.indexOf(',', startIdx)
        rawStr = rawStr.replace(rawStr.substring(startIdx, endIdx + 1), replaceItemArr[i])
    }
    console.log(rawStr)
    navigator.clipboard.writeText(rawStr)
}

function acm() {
    let ajax = new XMLHttpRequest();
    /**
     * get dois from URL
     */
    const url = window.location.pathname
    let diosIdx
    for (let i = 0; i < url.length; i++) {
        let reg = /^[0-9]+.?[0-9]*$/;
        if (reg.test(parseInt(url[i]))) {
            diosIdx = i
            break
        }
    }
    let dois = window.location.pathname.substring(diosIdx, window.location.pathname.length)
    let targetFile = 'custom-bibtex'
    let format = 'bibTex'
    ajax.open('get', `${window.location.origin}/action/exportCiteProcCitation?dois=${dois}&targetFile=${targetFile}&format=${format}`);
    ajax.send(null);
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            /**
             * process raw data
             */
            let rawStr = ajax.response;
            let idx = rawStr.indexOf('"contentType":"Application/x-bibtex","items":')
            rawStr = rawStr.substring(idx + '"contentType":"Application/x-bibtex","items":'.length, rawStr.length - 1)

            let rawJSON = JSON.parse(rawStr)
            let rawObj = rawJSON[0][dois]
            let resArr = []
            /**
             * process common data
             */
            let authorArr = []
            for (const i of rawObj.author) {
                authorArr.push(`${i.family}, ${i.given}`)
            }
            /**
             * process unique data
             */
            if (rawObj.type === 'PAPER_CONFERENCE' || rawObj.type === 'CHAPTER') {
                resArr.push(`@inproceedings{${rawObj.id},\n`)
                resArr.push(`title = {${rawObj.title}},\n`)
                resArr.push(`author = {${authorArr.join(' and ')}},\n`)
                resArr.push(`booktitle = {${rawObj['container-title']}},\n`)
                resArr.push(`publisher = {${rawObj.publisher}},\n`)
                let arr = document.getElementsByClassName("article__tocHeading");
                const series = document.getElementsByClassName("article__tocHeading")[arr.length - 2].innerHTML
                resArr.push(`year = {20${series.match(/\d+(.\d+)?/g)}},\n`)
                resArr.push(`series = {${series}}\n`)
            }
            if (rawObj.type === 'ARTICLE') {
                resArr.push(`@article{${rawObj.id},\n`)
                resArr.push(`title = {${rawObj.title}},\n`)
                resArr.push(`author = {${authorArr.join(' and ')}},\n`)
                resArr.push(`journal = {${rawObj['container-title']}},\n`)
                resArr.push(`volume = {${rawObj.volume}},\n`)
                resArr.push(`pages = {${rawObj.page}},\n`)
                resArr.push(`year = {${rawObj.issued['date-parts'][0][0]}}\n`)
            }
            resArr.push('}')
            console.log(resArr.join(''))
            navigator.clipboard.writeText(resArr.join(''))
        }
    }
}

function arxiv() {
    let ajax = new XMLHttpRequest();
    /**
     * get dois from URL
     */
    const url = window.location.pathname
    let diosIdx
    for (let i = 0; i < url.length; i++) {
        let reg = /^[0-9]+.?[0-9]*$/;
        if (reg.test(parseInt(url[i]))) {
            diosIdx = i
            break
        }
    }
    let dois = window.location.pathname.substring(diosIdx, window.location.pathname.length)
    ajax.open('get', `${window.location.origin}/bibtex/${dois}`);
    ajax.send(null);
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4 && ajax.status == 200) {
            let rawStr = ajax.response
            rawStr = rawStr.replace('misc', 'article')
            rawStr = rawStr.split('eprint').join('journal = {CoRR},\n      volume')
            let startIdx = rawStr.indexOf('volume={')
            let endIdx = rawStr.indexOf('},', startIdx)
            rawStr = rawStr.replace(rawStr.substring(startIdx + 'volume={'.length, endIdx), url.substring(1, url.length))
            const removeArr = ['archivePrefix', 'primaryClass']
            for (let i of removeArr) {
                let idx1 = rawStr.indexOf(i)
                let idx2 = rawStr.indexOf('\n', idx1)
                rawStr = rawStr.replace(rawStr.substring(idx1, idx2 + 3), '')
            }
            let idx3 = rawStr.lastIndexOf(',')
            rawStr = rawStr.replace(rawStr.substring(idx3, rawStr.length), '\n}')
            navigator.clipboard.writeText(rawStr)
            console.log(rawStr)
        }
    }
}

function neurips() {
    let resArr = []
    resArr.push('@inproceedings{\n')
    resArr.push(`title = {${document.getElementsByTagName("title")[0].innerHTML}},\n`)
    let authorArr = []
    let rawDOM = document.getElementsByName("citation_author");
    for (let i of rawDOM) {
        authorArr.push(`${i.content}`)
    }
    resArr.push(`author = {${authorArr.join(' and ')}}`)
    resArr.push(`booktitle = {${document.getElementsByName("citation_journal_title")[0].content}},\n`)
    let year = document.getElementsByName("citation_publication_date")[0].content
    resArr.push(`year = {${year}},\n`)
    resArr.push(`series = {NeurIPS '${year.slice(2, 4)}}\n`)
    resArr.push('}')
    navigator.clipboard.writeText(resArr.join(''))
    console.log(resArr.join(''))
}