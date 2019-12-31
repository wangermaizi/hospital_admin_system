function parseTime(Time) {
    let tiem = new Date(Time);
    let years = tiem.getFullYear();
    let months = tiem.getMonth();
    months = parseInt(months)+1;
    let data = tiem.getDate();
    let str = `${years}-${months}-${data}`;
    return str;
}


module.exports = parseTime;