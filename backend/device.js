import Bowser from "bowser";
const browser = Bowser.getParser(window.navigator.userAgent);
console.log(browser.getResult());