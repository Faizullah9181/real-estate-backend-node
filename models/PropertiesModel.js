const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const PropertiesModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    listing_media: {
      type: Array,
      required: true,
    },
    property_address: {
      address: {
        type: String,
        required: true,
      },
    },
    property_size: {
      type: Number,
      required: true,
    },
    property_lot_size: {
      type: Number,
      required: true,
    },
    property_rooms: {
      type: Number,
      required: false,
    },
    property_bed_rooms: {
      type: Number,
      required: false,
    },
    property_bath_rooms: {
      type: Number,
      required: false,
    },
    property_garages: {
      type: Number,
      required: false,
    },
    property_year_built: {
      type: Number,
      required: true,
    },
    property_garages_size: {
      type: Number,
      required: false,
    },
    property_amenities: {
      type: Array,
      required: false,
    },
    property_total_reviews: {
      type: Number,
      default: 0,
    },
    property_average_rating: {
      type: Number,
      default: 0,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true }
);
PropertiesModel.plugin(mongoosePaginate);
module.exports = mongoose.model("properties", PropertiesModel);

