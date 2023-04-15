import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal"
import { deleteReview} from "../../store/reviews";
import { fetchSpot } from "../../store/spots";
import './DeleteReviewModal.css'

function DeleteReviewModal({ revId, spotId }) {
    const { closeModal } = useModal();
    const dispatch = useDispatch();

    const handleDelete = async (e) => {
        e.preventDefault();

        // dispatch deleteReview action with the review id
        await dispatch(deleteReview(revId))

        // dispatch fetchSpot action with the spot id to update the spot data after review deletion
        await dispatch(fetchSpot(spotId))
        .then(closeModal())
    }
    return (
        <div className="modal3">
            <h1 className="form-header">Confirm Delete</h1>
            <label>Are you sure you want to delete this review?</label>
            <button className="delete3" onClick={handleDelete}>Yes (Delete Review)</button>
            <button className="modal-button3" onClick={closeModal}>No (Keep Review)</button>
        </div>
    )
}

export default DeleteReviewModal