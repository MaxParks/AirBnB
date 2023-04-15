import { useEffect,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PictureBox from '../PictureBox';
import { fetchSpots } from '../../store/spots';
import './Homepage.css'


const Homepage = () => {

    // get spots from the store
    const  spots  = useSelector(state => state.spots.allSpots);

    const dispatch = useDispatch();

    // state to indicate whether spots have been fetched successfully
    // state to hold spots that have a valid ownerId
    const [loaded, setLoaded] = useState(false)
    const [validSpots, setValidSpots] = useState([])

    useEffect(() => {
        (async () => await dispatch(fetchSpots()).then((data) => {
            // setValidSpots(Object.values(data).filter(spot => spot.ownerId))
            setLoaded(true)}))()
    }, [dispatch]);
    // console.log('VALIDSPOTSS', validSpots)

    // render when spots have been fetched successfully
    return loaded && (
    <div>
            <ul className='thing-one'>
                {
       Object.values(spots).map((spot, index) => (
          <Link to={`/spots/${spot.id}`} key={`${spot.id}-${index}`}>
              <li className='thing-two'>
                  <PictureBox spot={spot} />
              </li>
          </Link>
      ))
                }
            </ul>
    </div>
    );
};

export default Homepage;

