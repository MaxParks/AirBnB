import { csrfFetch } from "./csrf"

// define action types
const LOAD_SPOT_REVIEWS = 'reviews/LOAD_SPOT_REVIEWS'
const SUBMIT_REVIEW = 'reviews/SUBMIT_REVIEW'
const DELETE_REVIEW = 'reviews/DELETE_REVIEW'


// define action creators
export const loadSpotReviews = reviews => ({
    type: LOAD_SPOT_REVIEWS,
    reviews
})
export const submitReview = review => ({
    type: SUBMIT_REVIEW,
    review
})
export const removeReview = reviewId => ({
    type: DELETE_REVIEW,
    reviewId
})


// define thunk actions
export const fetchSpotReviews = (spotId) => async dispatch => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`)

    if (response.ok) {

                const data = await response.json();
                dispatch(loadSpotReviews(data.Reviews))

    }
}

export const postReview = (data, spotId) => async dispatch => {

    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {

        method: 'POST',
        body: JSON.stringify(data)

    })
            const review = await response.json();
         dispatch(submitReview(review))
    return review
}

export const deleteReview = (reviewId) => async dispatch => {

    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
    })

    if (response.ok) {
        await response.json();
        dispatch(removeReview(reviewId))
        }
    
}



//review reducer
const initialState = {}

export const reviewsReducer = (state = initialState, action) => {
    const newState ={...state}
    switch(action.type) {

        case LOAD_SPOT_REVIEWS:
            const allReviews = {};
            if(!action.reviews) return allReviews
            action.reviews.forEach(review => {
                allReviews[review.id] = review;
            })
            return allReviews

        case SUBMIT_REVIEW:
            newState[action.review.id] = action.review
            return newState

        case DELETE_REVIEW:
            delete newState[action.reviewId]
            return newState
            
        default:
            return state
    }
}