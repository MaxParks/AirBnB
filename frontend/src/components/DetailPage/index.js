import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchSpot } from '../../store/spots';
import SpotReviews from '../SpotReviews';
import './DetailPage.css';

const DetailPage = () => {
  // get spotId from URL params
  const { spotId } = useParams();

  // select the spot and rating from the store
  const spot = useSelector((state) => state.spots.spot);
  // const user = useSelector(state => state.session.user)
  const rating = parseFloat(spot?.avgRating)?.toFixed(2);

  // fet the number of reviews for this spot from the store
  const reviewCount = useSelector((state) => Object.values(state.reviews).length);
  const dispatch = useDispatch();
  
// get the spot with the ID when mounted or the review count changes
  useEffect(() => {
    dispatch(fetchSpot(spotId))
    // .then((data) => console.log('@@@@@',data)) 
  }, [dispatch, spotId, reviewCount]);

  //the details card with the spot's rating and number of reviews
  const renderDetailsCard = () => {
    if (reviewCount === 0) {
      return <p><i className="fa-solid fa-star"></i> New</p>;
    }
    return (
      <p>
        <i className="fa-solid fa-star"></i> {rating} · {reviewCount}{' '}
        {reviewCount > 1 ? 'Reviews' : 'Review'}
      </p>
    );
  };

  const handleReserveClick = () => {
    alert('Feature coming soon');
  };

  return spot && (
    
    <div className="images-container">
      <div className="preview-image-container">
        {spot.Spotimages.map((spotImg) => (
          spotImg.preview ? (
            <img className='preview-image111' key={spotImg.id} src={spotImg.url} alt='previewImage'/>
          ) : null
        ))}
      </div>
      <div className="additional-images-container">
        {spot.Spotimages.map((spotImg) => (
          !spotImg.preview ? (
            <img className='additional-image' key={spotImg.id} src={spotImg.url} alt='additionalImage'/>
          ) : null
        )).slice(0, 4)}
      
    </div>
      <div className="spotname">
        <h1>{spot.name}</h1>
        </div>
        <div className='location'>
        <p>Location: {spot.city}, {spot.state}, {spot.country}</p>
      </div>
      <div className='hosted'> hosted by {spot.Owner.firstName} {spot.Owner.lastName}</div>
      <div className='description'><p>{spot.description}</p></div>
      <div className='detail-review'>
      <div className="detailscard">
        <p>${spot.price} night</p>
        {renderDetailsCard()}
        <button className='reserve-button' onClick={handleReserveClick}>Reserve</button>
      </div>
      <div className="review-container">
        {renderDetailsCard()}
        <SpotReviews />
      </div>
      </div>
    </div>
  );
};

export default DetailPage;