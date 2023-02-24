const express = require('express')
const { Op } = require("sequelize")
const {restoreUser, requireAuth } = require('../../utils/auth')
const {Spot, Spotimage} = require('../../db/models')
const router = express.Router()


//Delete a Spot Image
router.delete('/:imageId', restoreUser, requireAuth, async (req, res) => {
    const { imageId } = req.params
    const { userId } = req.user
  
    const image = await Spotimage.findByPk(imageId, {
      include: [{ model: Spot, as: 'Spot' }],
    })
  
    if (!image) {
      return res.status(404).json({
        message: "Spot Image couldn't be found",
        statusCode: 404,
      })
    }
  
    if (image.Spot.userId !== userId) {
      return res.status(403).json({
        message: 'Forbidden',
        statusCode: 403,
      })
    }
  
    await image.destroy()
    return res.json({ message: 'Successfully deleted', statusCode: 200 })
  })

module.exports = router