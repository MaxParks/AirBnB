import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom"
import { fetchSpot, putSpot } from "../../store/spots";

const UpdateSpotForm = () => {
    // get spotId from URL params
    const { spotId } = useParams()

    // get spot from my store
    const spot = useSelector(state => state.spots.spot)

    const dispatch = useDispatch();
    const history = useHistory();

        // init state variables/update functions
    const [validationErrors, setValidationErrors] = useState([]);
    const [hasSubmitted, setHasSubmitted] = useState(false)

     const [country, setCountry] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
      const [price, setPrice] = useState('');

        // updateing state when user types
       const updateCountry = (e) => setCountry(e.target.value);
       const updateAddress = (e) => setAddress(e.target.value);
       const updateCity = (e) => setCity(e.target.value);
       const updateState = (e) => setState(e.target.value);
       const updateDescription = (e) => setDescription(e.target.value);
       const updateName = (e) => setName(e.target.value);
       const updatePrice = (e) => setPrice(e.target.value);

    //validations when fields change
    useEffect(() => {

        const errors = [];
        if(!country?.length) errors.push('Country is required')
        if(!address?.length) errors.push('Address is required')
        if(!city?.length) errors.push('City is required')
        if(!state?.length) errors.push('State is required')
        if(!description?.length) errors.push('Description is required')
        if(!name?.length) errors.push('Name is required')
        if(!Number(price)) errors.push('Price is required')
        setValidationErrors(errors)

    }, [country, city, address, state,description, name, price])

    //fetching spot on load
    useEffect(() => {
        dispatch(fetchSpot(spotId))
    }, [dispatch, spotId])

        //setting form to spots values
    useEffect(() => {
        setCountry(spot?.country)
        setAddress(spot?.address)
        setCity(spot?.city)
        setState(spot?.state)
        setDescription(spot?.description)
        setName(spot?.name)
        setPrice(spot?.price)
    }, [spot])

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        //form is submitted and return if there are errors
        setHasSubmitted(true);
        if(validationErrors.length) return;
      
        const payload = {
          id: spotId,
          country,
          address,
          city,
          state,
          description,
          name,
          price
        };
        
        //PUT
        const updatedSpot = await dispatch(putSpot(payload));
        setAddress('');
        setCity('');
        setCountry('');
        setDescription('');
        setName('');
        setPrice('');
        setHasSubmitted(false);
        
        if (updatedSpot) {
          history.push(`/spots/${updatedSpot.id}`);
        }
      };
      
      
    
            return (
                <div className="form">
                    <form onSubmit={handleSubmit}>
                    <h1> Update Your Spot </h1>
                    <h2> Where's your place located?</h2>
                    <p>Guests will only get your exact address once they booked a reservation.</p>
                        <label htmlFor='Country'>Country</label>
                        {hasSubmitted && !country && (
                            <label htmlFor='Country' className='field-error'>Country is required</label>
                        )}
                        <input
                            type='text'
                            name='Country'
                            placeholder="Country"
                            value={country}
                            onChange={updateCountry}
                        />

                        <label htmlFor='Address'>Street Address</label>
                        {hasSubmitted && !address && (
                            <label htmlFor='Address' className='field-error'>Address is required</label>
                        )}
                        <input
                            type='text'
                            name='Address'
                            placeholder="Address"
                            value={address}
                            onChange={updateAddress}
                        />

                        <label htmlFor='City'>City</label>
                        {hasSubmitted && !city && (
                            <label htmlFor='City' className='field-error'>City is required</label>
                        )}
                        <input
                            type='text'
                            name='City'
                            placeholder="City"
                            value={city}
                            onChange={updateCity}
                        />

                        <label htmlFor='State'>State</label>
                        {hasSubmitted && !state && (
                            <label htmlFor='State' className='field-error'>State is required</label>
                        )}
                        <input
                            type='text'
                            name='State'
                            placeholder="STATE"
                            value={state}
                            onChange={updateState}
                        />

                        <h2>Describe your place to guests</h2>
                        <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
                        <textarea
                            name='Description'
                            placeholder="Please write at least 30 characters"
                            minLength='30'
                            value={description}
                            onChange={updateDescription}
                        />

                        {hasSubmitted && description.length < 30 && (
                            <label htmlFor='Description' className='field-error'>Description needs a minimum of 30 characters</label>
                        )}
                        <h2>Create a title for your spot</h2>
                        <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
                        <input
                            type='text'
                            name='Name'
                            placeholder="Name of your spot"
                            value={name}
                            onChange={updateName}
                        />

                        {hasSubmitted && !name && (
                            <label htmlFor='Name' className='field-error'>Name is required</label>
                        )}
                        <h2>Set a base price for your spot</h2>
                        <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                        $<input
                            type='text'
                            name='Price'
                            placeholder="Price per night (USD)"
                            value={price}
                            onChange={updatePrice}
                        />
                        
                        {hasSubmitted && !price && (
                            <label htmlFor='Price' className='field-error'>Price is required</label>
                        )}
                        <button type="submit">Update Your Spot</button>
                    </form>
                </div>
            )
}
export default UpdateSpotForm;