const express = require('express')
const {Op} = require("sequelize")
const {restoreUser, requireAuth } = require('../../utils/auth')
const { sequelize,Spot, Spotimage,Booking } = require('../../db/models')
const router = express.Router()


// Get all of the Current User's Bookings

router.get('/current', restoreUser,requireAuth, async (req, res) => {
   
      const userId = req.user.id
      const bookings = await Booking.findAll({
        where: { userId },
        include: [
          {
            model: Spot,
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
              'price',
              [sequelize.fn('', sequelize.col('url')), 'previewImage'],
            ],
            include: [
              {
                model: Spotimage,
                attributes: [],
                where: {
                  preview: true,
                },
              },
            ],
          },
        ],
      })
      
      res.status(200).json({ Bookings: bookings })
    })

    // Edit a Booking
router.put('/:bookingId',restoreUser, requireAuth, async (req, res) => {

    const booking = await Booking.findByPk(req.params.bookingId)

    if (!booking) {
      return res.status(404).json({
        message: "Booking couldn't be found",
        statusCode: 404
      })
    }

    if (booking.userId !== req.user.id) {
        return res.status(403).json({
          message: "Forbidden",
          statusCode: 403
        })
      }

      if (new Date(booking.endDate) < new Date()) {
        return res.status(403).json({
          message: "Past bookings can't be modified",
          statusCode: 403
        })
      }

      const { startDate, endDate } = req.body

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: "Validation error",
        statusCode: 400,
        errors: {
          endDate: "endDate cannot come before startDate"
        }
      })
    }

    const conflictingBooking = await Booking.findOne({
        where: {
          spotId: booking.spotId,
          startDate: {
            [Op.lt]: endDate
          },
          endDate: {
            [Op.gt]: startDate
          },
          id: {
            [Op.ne]: booking.id
          }
        }
      })

      if (conflictingBooking) {
        return res.status(403).json({
          message: "Sorry, this spot is already booked for the specified dates",
          statusCode: 403,
          errors: {
            startDate: "Start date conflicts with an existing booking",
            endDate: "End date conflicts with an existing booking"
          }
        })
      }

    booking.startDate = startDate
    booking.endDate = endDate
    await booking.save()

    const updatedBooking = await Booking.findByPk(booking.id)

    res.json(updatedBooking)
})

// Delete a Booking
router.delete('/:bookingId', restoreUser, requireAuth, async (req, res) => {

  const { bookingId } = req.params;
  const { userId } = req.user

  const booking = await Booking.findByPk(bookingId, { include: Spot })

    if (!booking) {
      return res.status(404).json({ message: "Booking couldn't be found", statusCode: 404 })
    }

    if (booking.startDate <= new Date()) {
      return res.status(403).json({ message: "Bookings that have been started can't be deleted", statusCode: 403 })
    }

    if (booking.userId !== userId && booking.Spot.userId !== userId) {
      return res.status(403).json({ message: "Forbidden", statusCode: 403 })
    }

    await booking.destroy()

    return res.json({ message: "Successfully deleted", statusCode: 200 })

})


module.exports = router