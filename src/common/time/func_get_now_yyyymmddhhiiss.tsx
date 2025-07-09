export function func_get_now_yyyymmddhhiiss() {
  const date = new Date();

  const year = date.getFullYear().toString();

  let month = new String(date.getMonth() + 1);

  let day = new String(date.getDate());

  let hour = date.getHours().toString();

  let minute = date.getMinutes().toString();

  let second = date.getSeconds().toString();

  // 한자리수일 경우 0을 채워준다.

  if (month.length === 1) {
    month = '0' + month;
  }

  if (day.length === 1) {
    day = '0' + day;
  }

  if (hour.length === 1) {
    hour = '0' + hour;
  }

  if (minute.length === 1) {
    minute = '0' + minute;
  }

  if (second.length === 1) {
    second = '0' + second;
  }

  return year + month + day + hour + minute + second;
}
