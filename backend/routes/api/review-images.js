const express = require('express')
const {Op} = require("sequelize")
const {restoreUser, requireAuth } = require('../../utils/auth')
const {Review, Reviewimage} = require('../../db/models')
const router = express.Router()


// Delete a Review Image
router.delete('/:imageId', restoreUser, requireAuth, async (req, res) => {
    const { imageId } = req.params
    const { user } = req
  
      const findImage = await Reviewimage.findByPk(imageId)

      if (!findImage) {
        return res.status(404).json({
          message: "Review Image couldn't be found",
          statusCode: 404,
        })
      }
  
      const findReview = await Review.findByPk(findImage.reviewId)
  
      if (findReview.userId !== user.id) {
        return res.status(403).json({
          message: 'Forbidden',
          statusCode: 403,
        })
      }
  
      await findImage.destroy()
  
      return res.status(200).json({
        message: 'Successfully deleted',
        statusCode: 200,
      })
  })
  
  module.exports = router