const express = require('express')
const {Op} = require("sequelize")
const {restoreUser, requireAuth} = require('../../utils/auth');
const { sequelize, User, Spot, Spotimage, Review} = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();


// Create a Spot
router.post('/', restoreUser, requireAuth,handleValidationErrors, async (req, res, next) => {

  const {user} = req
  const newSpotData = req.body

  try {
      newSpotData.ownerId = user.id
      const addSpot = await Spot.create(newSpotData)

      return res.status(201).json(addSpot)

  } catch(err) {

      console.log(err)

      res.status(400).json({
          message: "Validation Error",
          statusCode: 400,
          errors: {
            address: "Street address is required",
            city: "City is required",
            state: "State is required",
            country: "Country is required",
            lat: "Latitude is not valid",
            lng: "Longitude is not valid",
            name: "Name must be less than 50 characters",
            description: "Description is required",
            price: "Price per day is required"
            }
      })

  }

})


// GET all spots
router.get('/',handleValidationErrors, async (req, res) => {
  try {

    const { maxLat, minLat, minLng, maxLng, minPrice, maxPrice } = req.query

    const where = {}

    if(maxLat && !minLat){
        where.lat = {[Op.lte]: maxLat };
    }

    if(minLat && !maxLat){
        where.lat = {[Op.gte]: minLat }
    }
    if(minLat && maxLat){
        where.lat = {[Op.between]: [minLat, maxLat] }
    }
    if(minLng && !maxLng){
        where.lng = {[Op.gte]: minLng };
    }

    if(maxLng && !minLng){
        where.lng = {[Op.lte]: maxLng };
    }

    if(maxLng && minLng){
        where.lng = {[Op.between]: [minLng, maxLng] }
    }

    if(minPrice && !maxPrice){
        where.price = {[Op.gte]: minPrice }
    }

    if(maxPrice && !minPrice){
        where.price = {[Op.lte]: maxPrice };
    }

    if(minPrice && maxPrice){
        where.price = {[Op.between]: [minPrice, maxPrice] }
    }


    let {page, size} = req.query;

    if (!page) page = 1;
    if (!size) size = 20;

    let pagination = {}
    if (parseInt(page) >= 1 && parseInt(size) >= 1) {
        pagination.limit = size;
        pagination.offset = size * (page - 1)
    }
    
    const allSpots = await Spot.findAll({
      attributes: [
        'id',
        'ownerId',
        'address',
        'city',
        'state',
        'country',
        'lat',
        'lng',
        'name',
        'description',
        'price',
        'createdAt',
        'updatedAt',

        //functions to create avgRating and previewImage
        [sequelize.fn('avg', sequelize.col('reviews.stars')), 'avgRating'],
        [sequelize.fn('', sequelize.col('spotImages.url')), 'previewImage'],
      ],
      include: [
        {
          model: Spotimage,
          attributes: [],
          where: { preview: true },
        },
        {
          model: Review,
          attributes: [],
        },
      ],
      group: ['Spot.id', 'spotimages.url', 'reviews.spotId'],
      where,
      ...pagination,
      subQuery: false
    
    });

    return res.status(200).json({
      Spots: allSpots,
      page,
      size
    });

  } catch(err) {

    console.log(err)

    res.status(400).json({
        message: "Validation Error",
        statusCode: 400,
        errors: {
          page: "Page must be greater than or equal to 1",
           size: "Size must be greater than or equal to 1",
          maxLat: "Maximum latitude is invalid",
          minLat: "Minimum latitude is invalid",
          minLng: "Maximum longitude is invalid",
          maxLng: "Minimum longitude is invalid",
          minPrice: "Maximum price must be greater than or equal to 0",
          maxPrice: "Minimum price must be greater than or equal to 0"
          }
    })

}
});

// Get all Spots owned by the Current User
router.get('/current', restoreUser, requireAuth, async (req, res, next) => {

  const { user } = req;

  const allSpots = await Spot.findAll({

      attributes: [

          "id",
          "ownerId",
          "address",
          "city",
          "state",
          "country",
          "lat",
          "lng",
          "name",
          "description",
          "price",
          "createdAt",
          "updatedAt",
          [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
          [sequelize.fn('', sequelize.col('url')), 'previewImage']
      ],

      include: [
          {
              model: Spotimage,
              attributes: [],
              where: {
                  preview: true
              }
          },
          {
              model: Review,
              attributes: [],
          }
      ],

      group:['Reviews.spotId', 'Spotimages.url', 'Spot.id'],


      where: {
          ownerId: user.id
      }

  })

  return res.status(200).json({
      Spots: allSpots
  })

})

// Get details of a Spot from an id
router.get('/:spotId', async (req, res, next) => {

  const spotId = req.params.spotId

  const theSpot = await Spot.findByPk(spotId, {

      attributes: [

          "id",
          "ownerId",
          "address",
          "city",
          "state",
          "country",
          "lat",
          "lng",
          "name",
          "description",
          "price",
          [sequelize.fn('count', sequelize.col('review')), 'numReviews'],
          [sequelize.fn('avg', sequelize.col('stars')), 'avgRating'],
          "createdAt",
          "updatedAt",

      ],

      include: [
          {
              model: Spotimage,
              attributes: [
                  'id', 'url', 'preview'
              ],
          },
          {
              model: Review,
              attributes: []
          },
          {
              model: User,
              as: "Owner",
              attributes: [
                  'id', 'firstName', 'lastName'
              ],


          }
      ],

      group:['Reviews.spotId', 'Spot.id', 'Spotimages.id'],

  })

  if(!theSpot){
      return next(new Error("Spot couldn't be found", 404))
  }

  return res.json({
      Spots: theSpot
  })
})

// Add image to Spot based on SpotId
router.post('/:spotId/images', restoreUser, requireAuth, handleValidationErrors, async (req, res, next) => {

  const spotId = req.params.spotId

  const newImage = req.body


  try {
      newImage.spotId = spotId

      const findSpot = await Spot.findByPk(spotId)

      if(!findSpot){
          return res.status(404).json({
              message: "Spot couldn't be found",
              statusCode: 404
          })
      }

      const addImage = await Spotimage.create(newImage)
      const {id,url,preview} = addImage
      // console.log(addImage)
      // return res.json(addImage)
      return res.json({id:id,url:url,preview:preview})
      
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
      statusCode: 500,
      errors: error,
    });
  }
})

// Edit a spot
router.put('/:spotId',restoreUser, requireAuth,handleValidationErrors, async (req, res) => {
  const spotId = req.params.spotId
  const userId = req.user.id

  try {
    const spot = await Spot.findOne({ where: { id: spotId, ownerId: userId } })

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found", statusCode: 404 })
    }

    spot.address = req.body.address;
    spot.city = req.body.city;
    spot.state = req.body.state;
    spot.country = req.body.country;
    spot.lat = req.body.lat;
    spot.lng = req.body.lng;
    spot.name = req.body.name;
    spot.description = req.body.description;
    spot.price = req.body.price;

    await spot.save();
    res.json(spot);

  } catch (error) {
    return res.status(400).json({
      message: "Validation Error",
      statusCode: 400,
      errors: {
          address: "Street address is required",
          city: "City is required",
          state: "State is required",
          country: "Country is required",
          lat: "Latitude is not valid",
          lng: "Longitude is not valid",
          name: "Name must be less than 50 characters",
          description: "Description is required",
          price: "Price per day is required"
      }
  })
  }
});

// Delete a spot
router.delete('/:spotId',restoreUser, requireAuth, async (req, res) => {
  try {
    const spotId = req.params.spotId
    const userId = req.user.id
    const spot = await Spot.findOne({ where: { id: spotId, ownerId: userId } })

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found", statusCode: 404 })
    }

    await spot.destroy()

    return res.status(200).json({ message: "Successfully deleted"})

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error", statusCode: 500 })
  }
});

module.exports = router;