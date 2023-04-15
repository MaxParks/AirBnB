import React from 'react';
import Tooltip from '../ToolTip';

import './PictureBox.css';

const PictureBox = ({ spot }) => {

  // set rating and price variables based on spot data
  const rating = parseFloat(spot.avgRating).toFixed(2);
  const price = parseFloat(spot.price).toFixed(2);

  // my little box
  return (
    <div className='square'>
      <Tooltip spotName={spot.name}>
        <img className='preview-image' src={spot.previewImage} alt='previewImage'/>
      </Tooltip>
      <div className='info'>
        <p>{spot.city}, {spot.state}<br/>
        <b>${price}</b> night</p>
      </div>
      <div className='rating'>
        {parseFloat(spot.avgRating) === 0 ? <p><i className="fa-solid fa-star"></i> New</p> : <p><i className="fa-solid fa-star"></i> {rating}</p>}
      </div>
    </div>
  );
};

export default PictureBox;