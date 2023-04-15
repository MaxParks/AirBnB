import { csrfFetch } from "./csrf";


//hardest part for me thanks for the help Blake Watts

// define action types
const LOAD_SPOTS = 'spots/LOAD_SPOTS'
const LOAD_SPOT = 'spots/LOAD_SPOT'
const LOAD_USER_SPOTS = 'spots/LOAD_USER_SPOTS'
const ADD_SPOT = 'spots/ADD_SPOT'
const UPDATE_SPOT = 'spots/UPDATE_SPOT'
const REMOVE_SPOT = 'spots/REMOVE_SPOT'
const ADD_IMAGES = 'spots/ADD_IMAGES'


// define action creators
        export const loadSpots = spots => ({
    type: LOAD_SPOTS,
    spots
})
export const loadSpot = spot => ({
    type: LOAD_SPOT,
    spot
})
export const loadUserSpots = spots => ({
    type: LOAD_USER_SPOTS,
    spots
})
export const addSpot = spot => ({
    type: ADD_SPOT,
    spot
})
    export const updateSpot = spot => ({
    type: UPDATE_SPOT,
    spot
})
export const removeSpot = spotId => ({
    type: REMOVE_SPOT,
    spotId
  });
export const addImages = (image, spotId) => ({
    type: ADD_IMAGES,
    image, spotId
})


// define thunk actions
export const fetchSpots = () => async dispatch => {
    const response = await csrfFetch('/api/spots')

    if (response.ok) {

        const payload = await response.json();
        const spots = {}
        payload.Spots.forEach(spot => {
            spots[spot.id] = spot
        })

        // console.log('PAYLOAD', payload)
        dispatch(loadSpots(spots))
        return payload
    }
}
export const fetchSpot = (spotId) => async dispatch => {
    const response = await csrfFetch(`/api/spots/${spotId}`)

    if (response.ok) {
        const payload = await response.json()
        dispatch(loadSpot(payload.Spots))
        return payload
    }

}

export const fetchUserSpots = () => async dispatch => {
    const response = await csrfFetch('/api/spots/current')
     
         if(response.ok) {
        const payload = await response.json();
        const spots = {}
        payload.Spots.forEach(spot => {
            spots[spot.id] = spot
        })
        // console.log('PAYLOAD333', payload)
        dispatch(loadUserSpots(spots))
    }
}

export const postSpot = (payload) => async dispatch => {
    let { imagesArray } = payload;
    imagesArray = imagesArray.map((url,i) => {
        let obj = {}
        if (i === 0) {
                obj.preview = true;
            obj.url = url;
        } else {
            obj.preview = false;
                obj.url = url;
        }
        return obj;

    })

    const response = await csrfFetch(`/api/spots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })


    if (response.ok) {

        const spot = await response.json()

        // console.log('SPOTTTTTTTTTTTT', spot)

        dispatch(addSpot(spot))
        for await (let image of imagesArray) {
            let imageRes = await csrfFetch(`/api/spots/${spot.id}/images`, {
                method: 'POST',
                body: JSON.stringify(image)
            })
            imageRes = await imageRes.json();

            dispatch(addImages(imageRes, spot.id))
        }
        
        return spot
    }
}
export const putSpot = (payload) => async dispatch => {

    const response = await csrfFetch(`/api/spots/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    
    if (response.ok) {
        const spot = await response.json()
        dispatch(updateSpot(spot))
        return spot
    }
}

export const deleteSpot = (spotId) => async dispatch => {
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method: 'DELETE',
    });
    if (response.ok) {
        dispatch(removeSpot(spotId));
      }
      return response;
    };


    // spots reducer
const initialState = {}

export const spotsReducer = (state = initialState, action) => {
    let newState = {...state}
    // console.log('ACTIOMN', action)
    switch(action.type) {
        
        case LOAD_SPOTS:
            newState.allSpots = action.spots
            return newState

        case UPDATE_SPOT:
            // newState.userSpots[action.putSpot.id] = action.spot
            // newState.allSpots[action.putSpot.id] = action.spot
            // return newState
            newState[action.spot.id] = action.spot
            return newState

        case ADD_SPOT:
            newState.userSpots = {}
            newState.userSpots[action.spot.id] = action.spot
            // newState.allSpots[action.spot.id] = action.spot
            // newState.allSpots[action.spot.id].Images = []
            if(newState.allSpots){
                newState.allSpots[action.spot.id] = action.spot
                newState.allSpots[action.spot.id].Images = []
            } else{
                newState.allSpots = {}
                newState.allSpots[action.spot.id] = action.spot
                newState.allSpots[action.spot.id].Images = []
            }
            return newState
            
        case LOAD_SPOT:
            newState.spot=action.spot
            return newState

        case LOAD_USER_SPOTS:
            // console.log('action', action)
            newState.userSpots = action.spots
            return newState
            case REMOVE_SPOT:
                // console.log(newState, action)
                delete newState.allSpots[action.spotId];
                delete newState.userSpots[action.spotId];
                return newState
            case ADD_IMAGES:
                const spotId = action.image.spotId;
                // console.log('HEREITIS', newState.allSpots[action.spotId])
                // const updatedSpot = {
                //     ...state[spotId],
                //     Images: [...newState.allSpots[spotId].Images, action.image]
                // };
                if(newState.allSpots){
                    newState.allSpots[action.spotId].Images = [...newState.allSpots[action.spotId].Images, action.image]
                } else{
                    newState.allSpots = {}
                    newState.allSpots[action.spotId].Images = [...newState.allSpots[action.spotId].Images, action.image]
                }
                
                return newState
        default:
            return state
    }
}