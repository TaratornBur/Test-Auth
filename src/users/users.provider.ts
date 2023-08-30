/* eslint-disable prettier/prettier */
import { Connection } from 'mongoose';
import { UserSchema } from './schema/users.schema';

export const userProviders = [
  {
    provide: 'USER_MODELL',
    useFactory: (connection: Connection) =>
      connection.model('user', UserSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
