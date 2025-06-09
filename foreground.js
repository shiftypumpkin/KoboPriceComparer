// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("This prints to the console of the page (injected only if the page url matched)")
/*Kobo book price comparer
Grab list of books from wishlist page, store current price, compare with any stored price and note change
 *  */
var wishbookList = {};
const initStorageCache = chrome.storage.local.get().then((items) => {
    // Copy the data retrieved from storage into bookList.
    Object.assign(wishbookList, items);
});

const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector('body');
    const observer = new MutationObserver(async (mutations) => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            await parseBookList();
        }
    });
    observer.observe(body, { childList: true, subtree: true });
};

window.onload = observeUrlChange;

async function parseBookList() {
    var elBody = document.getElementsByTagName("body")[0];
    var elHtml = document.getElementsByTagName("html")[0];
    try {
        await initStorageCache;
    } catch (e) {
        console.log(e);
        // Handle error that occurred during storage initialization.
    }
    document.querySelectorAll('ul.wishlist-content li.wishlist-item').forEach((item) => { parseBookItem(item); });
}

function parseBookItem(book) {
    var bookId = book.getAttribute("data-track-info").replace('{"productId":"', '').replace('"}', '');
    var priceElement = (book.querySelectorAll("p.price").length > 1) ? book.querySelectorAll("p.price")[1]
        : (book.querySelectorAll("span.was-price").length > 1) ? book.querySelectorAll("span.was-price")[1] : null;
    var priceSale = (book.querySelectorAll("span.sale-price").length > 1) ? book.querySelectorAll("span.sale-price")[1].innerText
        : (book.querySelectorAll("span.price").length > 0) ? book.querySelectorAll("span.price")[1].innerText : "---";
    var priceVal = (priceElement != null) ? priceElement.innerText : "----";
    var curDate = new Date().toLocaleDateString("en-US");
    var prevBook = wishbookList[bookId];
    var title = book.querySelectorAll("a.heading-link")[0].innerText;
    var series = (book.querySelectorAll("span.series a").length > 0) ? book.querySelectorAll("span.series a")[0].innerText : "";
    var blurb = book.querySelectorAll("span.synopsis-text")[0].innerText;
    var author = book.querySelectorAll("ul.contributor-names li a")[0].innerText;
    var preorder = (book.querySelectorAll("p.preorder-subtitle").length > 0) ? book.querySelectorAll("p.preorder-subtitle")[0].innerText : "";

    if (prevBook && prevBook.price != priceVal) {
        priceElement.style["color"] = "#FF0000";
        priceElement.innerText += " \n " + prevBook.price + " (" + prevBook.date + ")";
    }

    wishbookList[bookId] = { "_title": title, "author": author, "series": series, "blurb": blurb, "preorder": preorder, "price": priceVal, "salePrice": priceSale, "date": curDate };
    chrome.storage.local.set(wishbookList);
}

document.addEventListener('load', () => parseBookList());

new PerformanceObserver((entryList) => {
    parseBookList();

}).observe({ type: 'largest-contentful-paint', buffered: true });

