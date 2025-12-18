import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "https://example.com/default-profile-pic.jpg",
  },
  age: {
    type: Number,
    required: true
  },
  qualification: {
    type: String,
    required: true
  },
  location: {
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    }
  },
  party: {
    type: String,
    required: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin Details', // or 'Admin', whatever your model is named
    required: true
  }
});

const candidateModel = mongoose.model("Candidate", candidateSchema);
export default candidateModel;
