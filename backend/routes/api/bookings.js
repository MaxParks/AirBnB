const express = require('express')
const {restoreUser, requireAuth } = require('../../utils/auth')
const { sequelize, User, Spot, Spotimage, Review, Reviewimage, Booking } = require('../../db/models')
const { check } = require('express-validator')
const router = express.Router()


// Get all of the Current User's Bookings

router.get('/current', restoreUser,requireAuth, async (req, res) => {
   
      const userId = req.user.id;
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
      });
      res.status(200).json({ Bookings: bookings });
    });

module.exports = router