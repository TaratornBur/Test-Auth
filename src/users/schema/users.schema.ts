/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto-js';
export const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // role: {
    //   type: String,
    //   required: false,
    // },
    status: {
      type: String,
    },
    order_history_by_orderId: {
      type: [String],
      default: undefined,
    },
    access_token: {
      type: String,
      default: false
    },
    refresh_token: {
      type: String,
      default: false
    },
    deleteAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true, versionKey: false },
);

UserSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (!user.isModified('password')) next();

  try {
    // const hash = await bcrypt.hashSync(user.password, 10);
    //const timestamp = Date.now().toString();
    const hash = crypto.AES.encrypt(
      user.password ,
      process.env.SECRET_KEY_FOR_PASSWORD,
    ).toString();
    user.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});
