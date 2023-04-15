import {useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { fetchSpotReviews, postReview } from "../../store/reviews";
import { fetchSpot } from "../../store/spots";
import "./PostReviewModal.css";

function PostReviewModal({ spotId }) {

  // get closeModal function from Modal context
  const { closeModal } = useModal();
  const dispatch = useDispatch();

  // init state values
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [review, setReview] = useState("");
  const [stars, setStars] = useState(0);
  const [error, setError] = useState(null);

   // function to update the review state
  const updateReview = (e) => setReview(e.target.value);

  // function to update the stars state
  const handleStar = (e, val) => {
    e.preventDefault();
    setStars(val);
  };

  // function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setHasSubmitted(true);

    const payload = {
      review,
      stars,
    };

    try {
      let newReview = await dispatch(postReview(payload, spotId));

      setReview("");
      setStars(0);
      setHasSubmitted(false);

      if (newReview) {
        await dispatch(fetchSpotReviews(spotId));
        await dispatch(fetchSpot(spotId)).then(closeModal());
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
      setHasSubmitted(false);
    }
  };

  // render it
  return (
    <div className="modal4">
      <h1>How was your stay?</h1>
      <form onSubmit={handleSubmit}>
        <textarea
        className="text-area2"
          type="text"
          name="review"
          placeholder="Leave your review here"
          value={review}
          onChange={updateReview}
        />
        
        <div>
            <label>Stars:</label>
            {[1, 2, 3, 4, 5].map((number) => (
                <i
                key={number}
                onClick={(e) => {
                    handleStar(e, number);
                }}
                className={
                    stars < number ? "fa-regular fa-star" : "fa-solid fa-star"
                }
                />
            ))}
            </div>
        <button
          type="submit"
          disabled={review.length < 10 || stars < 1}
        >
          Submit Your Review
        </button>
      </form>
    </div>
  );
}
export default PostReviewModal;


