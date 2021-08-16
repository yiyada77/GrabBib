document.addEventListener('DOMContentLoaded', function () {
    const host = window.location.host
    switch (true) {
        case (host.indexOf('usenix') > -1):
            usenix();
            break;
        case (host.indexOf('acm.org') > -1):
            acm();
            break;
        case (host.indexOf('arxiv.org') > -1):
            arxiv();
            break;
        case (host.indexOf('nips') > -1):
            neurips();
            break;
        case (host.indexOf('mlr.press') > -1):
            icml();
            break;
        default: return;
    }
});

function usenix() {
    let bib = document.getElementsByClassName("bibtex-text-entry bibtex-accordion-text-entry")[0].innerHTML
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

    let title = rawStr.substring(rawStr.indexOf('title') + 9, rawStr.indexOf('booktitle') - 4)
    console.log(rawStr)
    rawStr = replaceBibKey(title, rawStr)

    /**
     * identify YEAR & FLAG
     */
    let yearIdx = rawStr.indexOf('year')
    const YEAR = rawStr.substring(yearIdx + 10, yearIdx + 12);
    const usenixFlagMap = {
        '{OSDI}': 'OSDI',
        '{NSDI}': 'NSDI',
        '{FAST}': 'FAST',
        '{USENIX} {ATC}': 'ATC',
        '{USENIX} Security': 'Security'
    }
    let FLAG
    for (let i in usenixFlagMap) {
        if (rawStr.indexOf(i) > -1) {
            FLAG = usenixFlagMap[i]
        }
    }

    let titleReplaceFlag, seriesReplaceItem
    if (FLAG === 'OSDI' || FLAG === 'NSDI' || FLAG === 'FAST') {
        titleReplaceFlag = ` ({${FLAG}} ${YEAR})`
        seriesReplaceItem = `series = {${FLAG} '${YEAR}},`
    } else if (FLAG === 'ATC') {
        titleReplaceFlag = ` ({USENIX} {${FLAG}} ${YEAR})`
        seriesReplaceItem = `series = {{USENIX} {${FLAG}} '${YEAR}},`
    } else if (FLAG === 'Security') {
        titleReplaceFlag = ` ({USENIX} ${FLAG} ${YEAR})`
        seriesReplaceItem = `series = {{USENIX} ${FLAG} '${YEAR}},`
    }
    const replaceFlagArr = ['month', titleReplaceFlag]
    const replaceItemArr = [seriesReplaceItem, '},']
    for (let i = 0; i < 2; i++) {
        let startIdx = rawStr.indexOf(replaceFlagArr[i])
        let endIdx = rawStr.indexOf(',', startIdx)
        rawStr = rawStr.replace(rawStr.substring(startIdx, endIdx + 1), replaceItemArr[i])
    }
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
                let arr = document.getElementsByClassName("article__tocHeading");
                const series = document.getElementsByClassName("article__tocHeading")[arr.length - 2].innerHTML
                let key = grabBibKey(rawObj.title, `${series.match(/\d+(.\d+)?/g)}`)
                resArr.push(`@inproceedings{${key},\n`)
                resArr.push(`title = {${rawObj.title}},\n`)
                resArr.push(`author = {${authorArr.join(' and ')}},\n`)
                resArr.push(`booktitle = {${rawObj['container-title']}},\n`)
                resArr.push(`publisher = {${rawObj.publisher}},\n`)
                resArr.push(`year = {20${series.match(/\d+(.\d+)?/g)}},\n`)
                resArr.push(`series = {${series}}\n`)
            }
            if (rawObj.type === 'ARTICLE') {
                let key = grabBibKey(rawObj.title, `${rawObj.issued['date-parts'][0][0]}`)
                resArr.push(`@article{${key},\n`)
                resArr.push(`title = {${rawObj.title}},\n`)
                resArr.push(`author = {${authorArr.join(' and ')}},\n`)
                resArr.push(`journal = {${rawObj['container-title']}},\n`)
                resArr.push(`volume = {${rawObj.volume}},\n`)
                resArr.push(`pages = {${rawObj.page}},\n`)
                resArr.push(`year = {${rawObj.issued['date-parts'][0][0]}}\n`)
            }
            resArr.push('}')
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
            let title = rawStr.substring(rawStr.indexOf('title') + 7, rawStr.indexOf('}'))
            rawStr = replaceBibKey(title, rawStr)
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
        }
    }
}

function neurips() {
    let url = window.location.href
    if (grabBibFromPDF(url)) {
        return;
    }

    let resArr = []
    let authorArr = []
    let rawDOM = document.getElementsByName("citation_author")
    let year = document.getElementsByName("citation_publication_date")[0].content
    let title = document.getElementsByTagName("title")[0].innerHTML
    let key = grabBibKey(title, year)

    for (let i of rawDOM) {
        authorArr.push(`${i.content}`)
    }

    resArr.push(`@inproceedings{${key},\n`)
    resArr.push(`title = {${title}},\n`)
    resArr.push(`author = {${authorArr.join(' and ')}},\n`)
    resArr.push(`booktitle = {${document.getElementsByName("citation_journal_title")[0].content}},\n`)
    resArr.push(`year = {${year}},\n`)
    resArr.push(`series = {NeurIPS '${year.slice(2, 4)}}\n`)
    resArr.push('}')

    navigator.clipboard.writeText(resArr.join(''))
}

function icml() {
    // let url = window.location.href
    // if (grabBibFromPDF(url)) {
    //     return;
    // }

    let bib = document.getElementsByClassName("citecode")[0].innerHTML
    bib = bib.replace(bib.substring(bib.indexOf('volume')), '')

    let year = bib.substring(bib.indexOf('year') + 10, bib.indexOf('year') + 14)
    bib = bib.replace(bib.substring(bib.indexOf('editor'), bib.lastIndexOf(',') + 1), `series = {ICML '${year.slice(2, 4)}}\n}`)

    console.log(bib)
    // const inputElement = document.querySelector('#input'); inputElement.select();
    // document.execCommand('copy')
    // import { clipboard } from '@bumble/clipboard'
    // // clipboard.writeText('write this to the clipboard')
    // // clipboardData.setData("Text", bib)
    // // navigator.clipboard.writeText(bib)
}