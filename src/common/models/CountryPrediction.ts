import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const countryPredictionModel: mongoose.Schema = new Schema({
  name: String,
  iso2: String,
  lastUpdated: String,
  history: [{ day: String, dailyDead: Number, dailyInfected: Number, dailyRecovered: Number }],
  predicted: [{
    day: String,
    dailyDead: Number,
    dailyInfected: Number,
    dailyRecovered: Number,
    weeklyDead: Number,
    weeklyInfected: Number,
    weeklyRecovered: Number,
  }],
  accuracy: { 
    dailyDead: Number, 
    dailyInfected: Number,
    dailyRecovered: Number,
    weeklyDead: Number,
    weeklyInfected: Number,
    weeklyRecovered: Number,
  },
}, { versionKey: false });

export default model('Predictions', countryPredictionModel);
