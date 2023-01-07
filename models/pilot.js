const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

console.log('connecting to', url)
mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const pilotSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  distance: Number,
  violationTime: String
})
pilotSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })


module.exports = mongoose.model("Pilot",pilotSchema);


