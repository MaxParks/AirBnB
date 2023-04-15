import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import ReviewBox from '../ReviewBox';
import OpenModalButton from '../OpenModalButton';
import PostReviewModal from '../PostReviewModal';
import DeleteReviewModal from '../DeleteReviewModal';
import { fetchSpotReviews } from '../../store/reviews';

const SpotReviews = () => {
  // get spotId from URL params
  const { spotId } = useParams();

  const dispatch = useDispatch();

  // get spot, user, and reviews from store
  const spot = useSelector((state) => state.spots[spotId]);
  const user = useSelector((state) => state.session.user);
  const reviews = useSelector((state) => state.reviews);

  // convert the reviews object to an array
  const reviewArray = Object.values(reviews);

  //see if user has already reviewed spot
  const alreadyReviewed = reviewArray.some(
    (rev) => rev.userId === user?.id
  );
  
  // fetch the spot reviews
  useEffect(() => {
    dispatch(fetchSpotReviews(spotId));
  }, [dispatch]);


  // sort reviews by date
  const sortedReviews = reviewArray.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );


  // show reviews and button to make a review
  // my post your review button still showing when user is the creator I messed something
  return (
    <div>
      {spot?.ownerId !== user?.id &&
        !alreadyReviewed &&
        user && (
          <OpenModalButton
            buttonText="Post Your Review"
            modalComponent={<PostReviewModal spotId={spotId} />}
          />
        )}
      {sortedReviews.length ? (

        sortedReviews.map((rev) => {
          const usersReview = rev.userId === user?.id;
          
          return (
            <div key={rev.id}>
              <ReviewBox rev={rev} />
              {usersReview && (
                <OpenModalButton
                  buttonText="Delete"
                  modalComponent={
                    <DeleteReviewModal revId={rev.id} spotId={spotId} />
                  }
                />
              )}
            </div>
          );
        })
      ) : (
        spot?.ownerId !== user?.id && user && <p>Be the first to post a review!</p>
      )}
    </div>
  );
};

export default SpotReviews;

