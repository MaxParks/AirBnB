const express = require('express')
const {Op} = require("sequelize")
const {restoreUser, requireAuth} = require('../../utils/auth');
const { sequelize, User, Spot, Spotimage, Review, Reviewimage, Booking} = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const {check,query} = require('express-validator');
const router = express.Router();

const validationFilters = [
  query('page')
      .customSanitizer(val => val || 1)
      .isInt({ min: 1, max: 10 })
      .withMessage("Page must be greater than or equal to 1"),
  query('size')
      .customSanitizer(val => val || 20)
      .isInt({ min: 1, max: 20 })
      .withMessage("Size must be greater than or equal to 1"),
  // query('maxLat')
  //     .isFloat({ min: -180, max: 180 })
  //     .withMessage("Maximum latitude is invalid")
  //     .optional(),
  // query('minLat')
  //     .isFloat({ min: -180, max: 180 })
  //     .withMessage("Minimum latitude is invalid")
  //     .optional(),
  // query('minLng')
  //     .isFloat({ min: -180, max: 180 })
  //     .withMessage("Maximum longitude is invalid")
  //     .optional(),
  // query('maxLng')
  //     .isFloat({ min: -180, max: 180 })
  //     .withMessage("Minimum longitude is invalid")
  //     .optional(),
  query('minPrice')
      .isInt({ min: 0 })
      .withMessage("Maximum price must be greater than or equal to 0")
      .optional(),
  query('maxPrice')
      .isInt({ min: 0 })
      .withMessage("Maximum price must be greater than or equal to 0")
      .optional(),
  handleValidationErrors
]


const validateReview = [
  check('review')
      .exists()
      .withMessage("Review text is required"),
  check('stars')
      .exists()
      .withMessage("Rating text is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors
]

const validateSpotBody = [
  check('name')
      .exists()
      .withMessage('Name is required')
      .trim()
      .isLength({min:1, max:50})
      .withMessage("Name must be less than 50 characters"),
  check('address')
      .exists()
      .withMessage("Street address is required")
      .trim(),
  check('city')
      .exists()
      .withMessage("City is required")
      .trim(),
  check('state')
      .exists()
      .withMessage("State is required")
      .trim(),
  check('country')
      .exists()
      .withMessage("Country is required")
      .trim(),
  // check('lat')
  //     .exists()
  //     .isFloat({ min: -180, max: 180 })
  //     .withMessage("Latitude is not valid"),
  // check('lng')
  //     .exists()
  //     .isFloat({ min: -180, max: 180 })
  //     .withMessage("Longitude is not valid"),
  check('description')
      .exists()
      .withMessage("Description is required")
      .trim(),
  check('price')
      .exists()
      .isInt({ min: 0 })
      .withMessage("Price per day is required"),
  handleValidationErrors
]


// GET all spots
router.get('/',validationFilters, async (req, res, next) => {
  
    const { maxLat, minLat, minLng, maxLng, minPrice, maxPrice } = req.query
    const where = {}
    let {page, size} = req.query;

    if (!page) page = 1
    if (!size) size = 20

    let pagination = {}
    if (parseInt(page) >= 1 && parseInt(size) >= 1) {
        pagination.limit = size;
        pagination.offset = size * (page - 1)
    }
    
    // Validations

    const errors = {}

    if (page < 1 || page > 10) {
      errors.page = 'Page must be an integer between 1 and 10';
    }
    if (size < 1 || size > 20) {
      errors.size = 'Size must be an integer between 1 and 20';
    }
    // if (minLat < -180 || minLat > 180) {
    //   errors.minLat = 'Minimum latitude must be between -90 and 90';
    // }
    // if (maxLat < -180 || maxLat > 180) {
    //   errors.maxLat = 'Maximum latitude must be between -90 and 90';
    // }
    // if (minLng < -180 || minLng > 180) {
    //   errors.minLng = 'Minimum longitude must be between -180 and 180';
    // }
    // if (maxLng < -180 || maxLng > 180) {
    //   errors.maxLng = 'Maximum longitude must be between -180 and 180';
    // }
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
      })
    }

    const allSpots = await Spot.findAll({

      attributes: [

          "id",
          "ownerId",
          "address",
          "city",
          "state",
          "country",
          // "lat",
          // "lng",
          "name",
          "description",
          "price",
          "createdAt",
          "updatedAt",
          [sequelize.fn('ROUND', sequelize.fn('COALESCE', sequelize.fn('avg', sequelize.col('stars')), 0)), 'avgRating'],
          [sequelize.fn('', sequelize.col('url')), 'previewImage']
      ],

      include: [
          {model: Spotimage,attributes: [],where: {preview: true}},
          {model: Review,attributes: [],}
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
})

// Get all Spots owned by the Current User
router.get('/current',async (req, res) => {
    const { user } = req
    if (user) {
      const allSpots = await Spot.findAll({
      attributes: [
        'id',
        'ownerId',
        'address',
        'city',
        'state',
        'country',
        // 'lat',
        // 'lng',
        'name',
        'description',
        'price',
        'createdAt',
        'updatedAt',
        [sequelize.fn('ROUND', sequelize.fn('COALESCE', sequelize.fn('avg', sequelize.col('stars')), 0)), 'avgRating'],
        [sequelize.fn('', sequelize.col('Spotimages.url')), 'previewImage']
      ],
      include: [
        {model: Spotimage,attributes: [],where: {preview: true}},
        {model: Review,attributes: []}
      ],
      group: [
        'Spot.id',
        'Reviews.spotId',
        'Spotimages.url'
      ],
      where: {
        ownerId: {
          [Op.eq]: user.id
        }
      }
    })
    return res.status(200).json({
      Spots: allSpots
    })
    
    }
    return res.status(404).json({
      errors:'no current signed in user'
    })
    
})

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
            {model: User,attributes: ['id', 'firstName', 'lastName']},
            {model: Reviewimage,attributes: ['id', 'url']},
          ]
    });
    return res.status(200).json({ Reviews: reviews })
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
      statusCode: 500
    })
  }
})

// Get details of a Spot from an id
router.get('/:spotId', async (req, res) => {

  const spotId = req.params.spotId

  const theSpot = await Spot.findByPk(spotId, {

      attributes: [

          "id",
          "ownerId",
          "address",
          "city",
          "state",
          "country",
          // "lat",
          // "lng",
          "name",
          "description",
          "price",
          [sequelize.fn('count', sequelize.col('review')), 'numReviews'],
          [sequelize.fn('ROUND', sequelize.fn('COALESCE', sequelize.fn('avg', sequelize.col('stars')), 0)), 'avgRating'],

      ],

      include: [
          {
              model: Spotimage,
              attributes: ['id', 'url', 'preview'],
          },
          {
              model: Review,
              attributes: []
          },
          {
              model: User,
              as: "Owner",
              attributes: ['id', 'firstName', 'lastName'],
          }
      ],

      group:['Reviews.spotId', 'Spot.id', 'Spotimages.id', 'Owner.id'],

  })
  // console.log('@@@@@@@@@@', theSpot)

  if (!theSpot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
      statusCode: 404,
    })
  }

  return res.json({ Spots: theSpot });
})


// Get all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', restoreUser, requireAuth, async (req, res) => {
  const spotId = req.params.spotId
  const userId = req.user.id

    const findSpot = await Spot.findByPk(spotId)


    if(!findSpot || findSpot === []){
        return res.status(404).json({message: "Spot couldn\'t be found",statusCode: 404})
      }

      if (findSpot.ownerId === userId) {
        const ownerBookings = await Booking.findAll({
          where: {
            userId: userId,
            spotId: findSpot.id
          },
          include: {
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          },
          attributes: ['spotId', 'startDate', 'endDate']
        });
      
        const serializedBookings = ownerBookings.map((booking) => {
          return {
            spotId: booking.spotId,
            userId: booking.userId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            user: {
              id: booking.User.id,
              firstName: booking.User.firstName,
              lastName: booking.User.lastName
            }
          }
        })
      
        return res.status(200).json({
          bookings: serializedBookings
        })
      }

      if (findSpot.ownerId !== userId) {
        const userBookings = await Booking.findAll({
          where: {
            userId: userId,
            spotId: findSpot.id
          },
          attributes: ['spotId', 'startDate', 'endDate']
        })
      
        const serializedBookings = userBookings.map((booking) => {
          return {
            spotId: booking.spotId,
            startDate: booking.startDate,
            endDate: booking.endDate
          }
        })
      
        return res.status(200).json({
          bookings: serializedBookings
        })
      }
    })


// Create a Spot
router.post('/', restoreUser, requireAuth,validateSpotBody, async (req, res, next) => {

  const { address, city, state, country, name, description, price } = req.body
  const ownerId = req.user.id

  const newSpot = await Spot.create({
    ownerId,
    address,
    city,
    state,
    country,
   
    name,
    description,
    price
  })

  return res.status(201).json(newSpot)

})

// Add image to Spot based on SpotId
router.post('/:spotId/images', restoreUser, requireAuth, async (req, res) => {

  const spotId = req.params.spotId
  const newImage = req.body
  const {user} = req


  try {
      newImage.spotId = spotId
      const spot = await Spot.findOne({ where: { id: spotId, ownerId: user.id } })

      if(!spot){
          return res.status(404).json({
              message: "Spot couldn't be found",
              statusCode: 404
          })
      }

      if(spot.ownerId !== user.id ){
        return res.status(403).json({message: 'Forbidden'})
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
    })
  }
})

// Edit a spot
router.put('/:spotId',restoreUser, requireAuth,validateSpotBody, async (req, res) => {
    const spotId = req.params.spotId
    const spot = await Spot.findByPk(spotId)
    const userId = req.user.id
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
        statusCode: 404,
      })
    }

    if (spot.ownerId !== userId) {
      return res.status(401).json({
        message: 'Forbidden',
        statusCode: 403,
      })
    }

    const updatedSpot = await spot.update(req.body)

    return res.status(200).json(updatedSpot)
})

// Delete a spot
router.delete('/:spotId',restoreUser, requireAuth, async (req, res) => {
    const spotId = req.params.spotId
    const userId = req.user.id
    const spot = await Spot.findOne({ where: { id: spotId, ownerId: userId } })

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found", statusCode: 404 })
    }
    
    if(spot.ownerId !== userId){
      return res.status(403).json({message: "Forbidden"})
  }

    await spot.destroy()

    return res.status(200).json({ message: "Successfully deleted"})
})


// Create a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', restoreUser, requireAuth,validateReview, async (req, res) => {
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

// Create a Booking from a Spot based on the Spot's id

router.post('/:id/bookings', requireAuth, async (req, res) => {
  try {
      const spotId = req.params.id
      const { startDate, endDate } = req.body
      const spot = await Spot.findByPk(spotId)

      if (!spot) {
          return res.status(404).json({
              message: "Spot couldn't be found",
              statusCode: 404
          })
      }
      if (spot.OwnerId === req.user.id) {
          return res.status(403).json({
              message: 'You cannot book your own spot',
              statusCode: 403
          })
      }
      if (endDate <= startDate) {
          return res.status(400).json({
              message: "Validation error",
              statusCode: 400,
              errors: [
                  "endDate cannot be on or before startDate"
              ]
          })
      }
      const existingBookings = await Booking.findAll({
          attributes: [[sequelize.fn('date', sequelize.col('startDate')), 'startDate'],
          [sequelize.fn('date', sequelize.col('endDate')), 'endDate']],
          where: {
              spotId,
              [Op.or]: [
                  { startDate: { [Op.between]: [startDate, endDate] } },
                  { endDate: { [Op.between]: [startDate, endDate] } },
                  { startDate: { [Op.lte]: startDate }, endDate: { [Op.gte]: endDate } }
              ]
          }
      })
      if (existingBookings.length) {
          return res.status(403).json({
              message: "Sorry, this spot is already booked for the specified dates",
              statusCode: 403,
              errors: [
                  "Start date conflicts with an existing booking",
                  "End date conflicts with an existing booking"
              ]
          })
      }
      const booking = await Booking.create({

          userId: req.user.id,
          spotId: spotId,
          startDate: new Date(req.body.startDate).toISOString().slice(0, 10),
          endDate: new Date(req.body.endDate).toISOString().slice(0, 10),
      })
      res.json(booking)
  } catch (error) {
      console.error(error)
      res.status(500).json({
          message: 'Internal server error',
          statusCode: 500
      })
  }
})


// Left some commented out console logs and unecessary try catch blocks cause i needed to test some stuff

module.exports = router