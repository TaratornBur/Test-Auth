/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
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
    const hash = await bcrypt.hashSync(user.password, 10);
    user.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

/** METHOD */
UserSchema.methods.comparePassword = async function comparePassword(
  attempt: string,
) {
  return await bcrypt.compare(attempt, this.password);
};
