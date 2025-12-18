import mongoose from "mongoose";

const voterSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin Details",
        required: true
    },
    voterId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
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
    voteCast: {
        type: Boolean,
        default: false
    },
    voteTransactionId: {
        type: String
    }
});

// Compound unique index for (admin + voterId)
voterSchema.index({ admin: 1, voterId: 1 }, { unique: true });
// Compound unique index for (admin + email)
voterSchema.index({ admin: 1, email: 1 }, { unique: true });

const Voter_Details = mongoose.model("Voter Database", voterSchema);
export default Voter_Details;
