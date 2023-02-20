const express = require('express')
const {Op} = require("sequelize")
const {setTokenCookie, restoreUser, requireAuth} = require('../../utils/auth');
const {User, Spot, Spotimage, Review, Reviewimage,sequelize} = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { check,body,query } = require('express-validator');
const router = express.Router();

const validateReviewImageBody = [
    body('url')
        .exists()
        .withMessage("URL is required")
        .isURL(),
    handleValidationErrors
  ]

  const validateReviewBody = [
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

// Get all Reviews of the Current User
router.get('/current', restoreUser, requireAuth, async (req, res) => {

    const {user} = req
    const reviews = await Review.findAll({
        
        where: { userId: user.id },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Spot,
            attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price',
            [sequelize.fn('', sequelize.col('url')), 'previewImage']]
          },
          {
            model: Reviewimage,
            attributes: ['id', 'url']
          }
        ]
      })
      res.status(200).json({ Reviews: reviews })
    })

    // Add an Image to a Review based on the Review's id
    router.post('/:reviewId/images',restoreUser, requireAuth, validateReviewImageBody, async (req, res) => {

        const { user } = req
        const { reviewId } = req.params
        const { url } = req.body
        
        const review = await Review.findOne({
            where: { id: reviewId, userId: user.id },
          })
      
        if (!review) {
          return res.status(404).json({
            message: "Review couldn't be found",
            statusCode: 404,
          });
        }
      
        const count = await Reviewimage.count({ where: { reviewId } })
        if (count >= 10) {
          return res.status(403).json({
            message: 'Maximum number of images for this resource was reached',
            statusCode: 403,
          });
        }
      
        const reviewImage = await Reviewimage.create({
            reviewId,
            url,
          })

            return res.status(200).json({ id: reviewImage.id, url: reviewImage.url })
        
      });


      // Edit a Review
      router.put('/:reviewId', restoreUser, requireAuth, validateReviewBody, async (req, res) => {

        const reviewId = req.params.reviewId
        const userId = req.user.id

  
    const review = await Review.findOne({
      where: { id: reviewId, userId },
    })

    if (!review) {
      return res.status(404).json({ message: 'Review couldn\'t be found', statusCode: 404 })
    }

    
    const { review: reviewText, stars } = req.body
    review.review = reviewText
    review.stars = stars

    await review.save()

    return res.json(review)
  
});

// Delete a Review

router.delete('/:reviewId', restoreUser, requireAuth, async (req, res, next) => {

    const {user} = req
    const reviewId = req.params.reviewId

    const findReview = await Review.findByPk(reviewId)

    if (!findReview) {
        return res.status(404).json({
          message: 'Review couldn\'t be found',
          statusCode: 404
        });
      }

    await findReview.destroy()

    return res.status(200).json({
        message: "Successfully deleted",
        statusCode: 200
    })

})



module.exports = router
