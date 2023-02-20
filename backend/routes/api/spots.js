const express = require('express')
const {Op} = require("sequelize")
const {restoreUser, requireAuth} = require('../../utils/auth');
const { sequelize, User, Spot, Spotimage, Review, Reviewimage} = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { check, query, body } = require('express-validator');
const router = express.Router();

const validateReview = [
  body('review')
      .exists()
      .withMessage("Review text is required"),
  body('stars')
      .exists()
      .withMessage("Rating text is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors
]


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
  
    const { maxLat, minLat, minLng, maxLng, minPrice, maxPrice } = req.query
    const where = {}
    let {page, size} = req.query;

    if (!page) page = 1;
    if (!size) size = 20;

    let pagination = {}
    if (parseInt(page) >= 1 && parseInt(size) >= 1) {
        pagination.limit = size;
        pagination.offset = size * (page - 1)
    }
    
    // Validations
    const errors = {};
    if (page < 1 || page > 10) {
      errors.page = 'Page must be an integer between 1 and 10';
    }
    if (size < 1 || size > 20) {
      errors.size = 'Size must be an integer between 1 and 20';
    }
    if (minLat < -90 || minLat > 90) {
      errors.minLat = 'Minimum latitude must be between -90 and 90';
    }
    if (maxLat < -90 || maxLat > 90) {
      errors.maxLat = 'Maximum latitude must be between -90 and 90';
    }
    if (minLng < -180 || minLng > 180) {
      errors.minLng = 'Minimum longitude must be between -180 and 180';
    }
    if (maxLng < -180 || maxLng > 180) {
      errors.maxLng = 'Maximum longitude must be between -180 and 180';
    }
    if (minPrice < 0) {
      errors.minPrice = 'Minimum price must be a decimal greater than or equal to 0';
    }
    if (maxPrice < 0) {
      errors.maxPrice = 'Maximum price must be a decimal greater than or equal to 0';
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Validation Error',
        statusCode: 400,
        errors: errors
      });
    }

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
              attributes: [
              ],
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
      where,
      ...pagination,
      subQuery: false


  });

  return res.status(200).json({
      Spots: allSpots,
      page,
      size
  })
  
});

// Get all Spots owned by the Current User
router.get('/current', restoreUser, requireAuth, async (req, res, next) => {

  const { user } = req

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

      group:['Reviews.spotId', 'Spot.id', 'Spotimages.id', 'Users.id'],

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

// Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res) => {
  try {
    const spotId = req.params.spotId
    const spot = await Spot.findByPk(spotId)
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
        statusCode: 404
      })
    }

    const reviews = await Review.findAll({
      where: { spotId },
      include: [
            {
                model: User,
                attributes: [
                    'id', 'firstName', 'lastName'
                ]
            },
            {
                model: Reviewimage,
                attributes: [
                    'id', 'url'
                ]
            },
        ]
    });
    return res.status(200).json({ Reviews: reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
      statusCode: 500
    });
  }
});

// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', restoreUser, requireAuth,validateReview, async (req, res, next) => {
  const { spotId } = req.params
  const { review, stars } = req.body
  const userId = req.user.id

  const spot = await Spot.findByPk(spotId)
    if (!spot) {
      return res.status(404).json({ message: 'Spot couldn\'t be found', statusCode: 404 })
    }

    const existingReview = await Review.findOne({ where: { userId, spotId } })
    if (existingReview) {
      return res.status(403).json({ message: 'User already has a review for this spot', statusCode: 403 })
    }

    const newReview = await Review.create({ review, stars, userId, spotId })

    return res.status(201).json(newReview)

})

module.exports = router;