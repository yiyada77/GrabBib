function grabBibKey(title, year) {
    /**
    * neurips acm
    */
    let key
    if (title.indexOf(':') > -1) {
        key = title.substring(0, title.indexOf(':'))
        key = key.replace(' ', '')
    } else {
        key = title.substring(0, title.indexOf(' '))
        key = `${key}${year.substring(year.length - 2)}`
    }
    key = key.replace('{', '')
    key = key.replace('}', '')
    return key
}

function replaceBibKey(title, rawStr) {
    /**
    * arxiv, usenix
    */
    if (title.indexOf(':') > -1) {
        let originKey = rawStr.substring(rawStr.indexOf('{') + 1, rawStr.indexOf(','))
        console.log(originKey)
        let key = title.substring(0, title.indexOf(':'))
        key = key.replace(' ', '')
        key = key.replace('{', '')
        key = key.replace('}', '')
        rawStr = rawStr.replace(originKey, key)
    }

    return rawStr
}


function grabBibFromPDF(url) {
    if (url.indexOf('pdf') > -1) {
        if (url.indexOf('nips') > -1) {
            url = url.replace('file', 'hash')
            url = url.replace('Paper.pdf', 'Abstract.html')
            window.open(url)
        }
        if (url.indexOf('mlr.press') > -1) {
            url = url.replace(url.substring(url.lastIndexOf('/')), '.html')
            window.open(url)
        }
        return 1
    }
    return 0
}

