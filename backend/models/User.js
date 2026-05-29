// =====================================================================
// User model
// =====================================================================
// Stores end users + admins. Passwords are stored as bcrypt hashes.
// `role` controls access for admin-only endpoints.
// =====================================================================

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: { type: String, trim: true, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['user', 'admin', 'advocate'],
      default: 'user',
      index: true
    },
    vehicles: [
      {
        number: { type: String, uppercase: true, trim: true },
        nickname: { type: String, default: '' }
      }
    ],
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
)

// ---- Virtuals --------------------------------------------------------
userSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    delete ret._id
    delete ret.passwordHash
    return ret
  }
})

// ---- Methods ---------------------------------------------------------
userSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10)
  this.passwordHash = await bcrypt.hash(plain, salt)
}

userSchema.methods.comparePassword = function (plain) {
  if (!this.passwordHash) return false
  return bcrypt.compare(plain, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)
