import "dayjs/locale/ko";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type DayjsArguType = Parameters<typeof dayjs>;
const dayjsWithTimezone = (...args: DayjsArguType) => dayjs(...args).tz('Asia/Seoul');

const GetSeoulTime = ({
  time,
}: {
  time: string | Date;
  long?: boolean;
}) => {
  if (typeof time !== 'string') {
    time = time.toString();
  }

  const date = dayjsWithTimezone(time);

  return (
    <div >
      <span >{date.year()}년</span>
      <span style ={{marginLeft:'0.3rem'}}>{date.month() + 1}월</span>
      <span style ={{marginLeft:'0.3rem'}}>{date.date()}일</span>
    </div>
  );
};

export default GetSeoulTime;
