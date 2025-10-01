const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  duration: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  },
  document: {
    filename: String,
    filepath: String,
    uploadedAt: Date
  }
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    default: 'Imarticus Learning'
  },
  duration: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 500
  },
  category: {
    type: String,
    enum: ['finance', 'technology', 'analytics', 'marketing', 'management'],
    default: 'technology'
  },
  modules: [moduleSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
