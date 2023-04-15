import { useDispatch} from "react-redux";
import { useModal } from "../../context/Modal"
import { deleteSpot} from "../../store/spots";
import './ConfirmDeleteModal.css'

function ConfirmDeleteModal({ spotId }) {
    const { closeModal } = useModal();
    const dispatch = useDispatch();
    

    const handleDelete = async (e) => {
        e.preventDefault();

        // dispatch deleteSpot action with the spotId
        await dispatch(deleteSpot(spotId))
        .then(closeModal())
    }
    
    // render confirmation modal with delete and cancel buttons
    return (
        <div className="modal2">
          <h1 className="form-header">Confirm Delete</h1>
          <label>Are you sure you want to remove this spot from the listings?</label>
          <button className="delete2" onClick={handleDelete}>
            Yes (Delete Spot)
          </button>
          <button className="modal-button2" onClick={closeModal}>
            No (Keep Spot)
          </button>
          <form></form>
        </div>
      );
    }

export default ConfirmDeleteModal