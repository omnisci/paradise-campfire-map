import { startDate } from '../common/config';
import { dayFormatter } from '../common/time-utils';

let timeLabel = null;

export function initTimeLabel() {
  timeLabel = document.querySelector('label.time-label');
  timeLabel.innerHTML = dayFormatter(startDate);
  console.log('time-label:endDate:', startDate.toUTCString());
}

export function updateTimeLabel(date) {
  timeLabel.innerHTML = dayFormatter(date);
}

export default timeLabel;
