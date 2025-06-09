var wishbookList = { };
const localStorageCache = chrome.storage.local.get().then((items) => {
    // Copy the data retrieved from storage into bookList.
    Object.assign(wishbookList, items);
});

async function parseBookList()
{
    var elBody = document.getElementsByTagName("body")[0];
    var elHtml = document.getElementsByTagName("html")[0];
    try {
        await localStorageCache;
    } catch (e) {
        console.log(e);
        // Handle error that occurred during storage initialization.
    }
    var arrBooks = [];
    for (var item in wishbookList) {
        arrBooks.push(wishbookList[item]);
    }
    var fldTitle = "Title [" + arrBooks.length + "]"

    var arrFields = ["Author", fldTitle, "Series", "Sale", "Price", "Preorder", "Scan"];
    let tbl = document.createElement("table");
    let tr = document.createElement("tr");

    for (var f in arrFields)
    {
        let th = document.createElement("th");
        let fldName = arrFields[f];

        th.setAttribute("id",fldName);
        th.append(fldName);
        tr.append(th);
    }
    tbl.append(tr);

    //Title, Author, Series, Price, Sale Price, Pre - order ...
    arrBooks.sort((a, b) => a.preorder.localeCompare(b.preorder) || a.author.localeCompare(b.author) || a.series.localeCompare(b.series) || a._title.localeCompare(b._title) );
    for (var b in arrBooks)
    {
        let tr = document.createElement("tr");
        
        if (arrBooks[b].preorder != "") {
        	tr.setAttribute("id","rowPreorder");
        }
        if (arrBooks[b].salePrice != "---") {
        	tr.setAttribute("id","rowSale");
        }
        
        buildTR(tr, arrBooks[b].author);
        buildTR(tr, arrBooks[b]._title.substring(0,40));
        buildTR(tr, arrBooks[b].series.substring(0,25));
        buildTR(tr, arrBooks[b].salePrice.replace("USD",""));
        buildTR(tr, arrBooks[b].price.replace("USD",""));
        buildTR(tr, arrBooks[b].preorder.replace("Available ",""));
        buildTR(tr, arrBooks[b].date);
        tbl.append(tr);
    }
    elBody.append(tbl);

    //{ "_title": title, "author": author, "series": series, "blurb": blurb, "preorder": preorder, "price": priceVal, "salePrice": priceSale, "date": curDate };
}

function buildTR(tr, fieldVal)
{
    let td = document.createElement("td");
    td.append(fieldVal.trim());
    tr.append(td);
}

document.addEventListener('DOMContentLoaded', parseBookList);