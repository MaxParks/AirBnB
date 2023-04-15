import { useSelector } from 'react-redux';
import './ReviewBox.css';

const ReviewBox = ({ rev }) => {

// grab user information from the store
const user = useSelector(state => state.session.user);

// gets the year from the review date
const year = rev?.createdAt.slice(0, 4);

// maps the month number to the month name
const monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const month = rev.createdAt.slice(5, 6) === '0' ? monthArray[rev.createdAt.slice(6, 7) - 1] : monthArray[rev.createdAt.slice(5, 7) - 1];

return (
<div className="review-box1">
{!rev.User ? (
<p>
<b>{user.firstName}</b><br />
{month} {year}<br />
{rev.review}
</p>
) : (
<p>
<b>{rev.User.firstName}</b><br />
{month} {year}<br />
{rev.review}
</p>
)}
</div>
);
};

export default ReviewBox;
