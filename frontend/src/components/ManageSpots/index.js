import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { fetchUserSpots } from '../../store/spots'
import { Link, useHistory } from 'react-router-dom'
import OpenModalButton from '../OpenModalButton'
import ConfirmDeleteModal from '../ConfirmDeleteModal'
import SpotTile from '../PictureBox'
import './ManageSpots.css'

const ManageSpots = () => {

    // get users spots from the store
    const spots = useSelector(state => Object.values(state.spots.userSpots))
    const dispatch = useDispatch()
    const history = useHistory()

    // fetch user's spots 
    useEffect(() => {
        dispatch(fetchUserSpots())
    }, [dispatch])

    const handleUpdate = (spotId) => {
        history.push(`/spots/${spotId}/edit`)
    }

    return spots && (
        <div>
            <h1>Manage Spots</h1>
            {spots.length === 0 ? (
      <button>
      <Link to="/spots/new">Create a New Spot</Link>
    </button>
    ) :
                <ul>
                    {
                        spots.map(spot => (
                            <div key={spot.id}>
                                <Link to={`/spots/${spot.id}`} key={spot.id}>
                                    <SpotTile spot={spot} />
                                </Link>
                                <br/>
                                <button key={`update-${spot.id}`} onClick={()=>{handleUpdate(spot.id)}}>Update</button>
                                <OpenModalButton
                                    buttonText="Delete"
                                    modalComponent={<ConfirmDeleteModal spotId={spot.id} />}
                                    key={`delete-${spot.id}`}
                                />
                            </div>
                        ))
                    }
                </ul>
            }
        </div>
    )
}

export default ManageSpots