/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';

export const DatabaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb://localhost:27017/Test-auth'),
  },
];
