function getCurrentTime() {
    let tiem = new Date();
    console.log(tiem);
    let years = tiem.getFullYear();
    let months = tiem.getMonth();
    months = parseInt(months)+1;
    let data = tiem.getDate();
    let str = `${years}-${months}-${data}`;
    return str;
}

module.exports = getCurrentTime;